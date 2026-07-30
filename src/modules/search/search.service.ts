import {
  Injectable,
  Logger,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchType } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { BrowserService } from '../browser/browser.service';
import { ProxyManagerService } from '../proxy/proxy-manager.service';
import { ParserFactory } from '../parser/parser.factory';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { MetricsService } from '../../infrastructure/monitoring/metrics.service';
import { BaseSearchDto, MapsSearchDto, PlacesSearchDto, ImagesSearchDto, NewsSearchDto } from './dto/search.dto';
import {
  SearchResponse,
  BatchSearchResponse,
  WebResult,
} from './interfaces/search-result.interface';
import { AuthenticatedUser } from '../../common/decorators/auth.decorator';
import {
  buildSearchUrl,
  SearchUrlOptions,
  supportsDuckDuckGoFallback,
  supportsDuckDuckGoImagesFallback,
  supportsNominatimFallback,
} from './builders/search-url.builder';
import { NominatimProvider } from './providers/nominatim.provider';
import { DuckDuckGoImagesProvider } from './providers/duckduckgo-images.provider';
import { getSearchCreditCost } from '../../config/credits.config';
import { CreditsService } from '../credits/credits.service';

type SearchSource = 'google' | 'duckduckgo' | 'nominatim';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly browserService: BrowserService,
    private readonly proxyManager: ProxyManagerService,
    private readonly parserFactory: ParserFactory,
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly nominatim: NominatimProvider,
    private readonly ddgImages: DuckDuckGoImagesProvider,
    private readonly creditsService: CreditsService,
  ) {}

  private creditCost(type: SearchType): number {
    return getSearchCreditCost(type);
  }

  async search(
    user: AuthenticatedUser,
    type: SearchType,
    dto: BaseSearchDto,
    options?: { skipBilling?: boolean },
  ): Promise<SearchResponse> {
    const start = Date.now();
    const gl = dto.gl ?? this.configService.get<string>('search.defaultCountry') ?? 'br';
    const hl = dto.hl ?? this.configService.get<string>('search.defaultLanguage') ?? 'pt';
    const device = dto.device ?? this.configService.get<string>('search.defaultDevice') ?? 'desktop';
    const num = dto.num || 10;
    const page = dto.page || 1;
    const engine = dto.engine ?? this.configService.get<string>('search.defaultEngine') ?? 'google';
    const urlOptions = this.extractUrlOptions(dto);
    const operationCost = this.creditCost(type);

    const cacheKey = this.cacheService.buildKey({
      type: type.toLowerCase(),
      query: dto.q,
      country: gl,
      language: hl,
      device,
      page,
      num,
      extra: {
        lat: urlOptions.lat ?? 0,
        lng: urlOptions.lng ?? 0,
        radius: urlOptions.radius ?? 0,
        placeType: urlOptions.placeType ?? '',
      },
    });

    if (!dto.noCache) {
      const cached = await this.cacheService.get<SearchResponse>(cacheKey, type);
      if (cached) {
        await this.logUsage(user, type, dto.q, gl, hl, device, Date.now() - start, true, true);
        this.metrics.searchRequestsTotal.inc({ type, cached: 'true', success: 'true' });
        return { ...cached, cached: true, responseTime: Date.now() - start };
      }
    }

    const searchUrl = buildSearchUrl(type, dto.q, gl, hl, page, num, urlOptions);
    let source: SearchSource = 'google';
    let html = '';

    try {
      const fetched = await this.fetchWithRetry(searchUrl, gl, type, dto.q, {
        waitForSelector: this.getWaitSelector(type),
      });
      html = fetched.html;
      source = fetched.source;
    } catch (error) {
      if (supportsNominatimFallback(type)) {
        this.logger.warn(`Google Maps falhou, usando Nominatim: ${(error as Error).message}`);
        source = 'nominatim';
      } else if (supportsDuckDuckGoImagesFallback(type)) {
        this.logger.warn(`Google Images falhou (${(error as Error).message}), usando DuckDuckGo Images`);
        source = 'duckduckgo';
      } else {
        throw error;
      }
    }

    let response: SearchResponse;

    if (source === 'nominatim') {
      response = await this.buildNominatimResponse(type, dto.q, hl, num, page, urlOptions);
    } else if (source === 'duckduckgo' && type === SearchType.IMAGES) {
      response = await this.buildDdgImagesResponse(dto.q, gl, hl, num, page);
    } else {
      response = await this.parseResults(type, html, num, {
        q: dto.q,
        gl,
        hl,
        engine: source === 'duckduckgo' ? 'duckduckgo' : engine,
        page,
        num,
      }, source);

      if (supportsNominatimFallback(type) && (!response.places || response.places.length === 0)) {
        this.logger.warn('Parser Google Maps vazio — fallback Nominatim');
        response = await this.buildNominatimResponse(type, dto.q, hl, num, page, urlOptions);
        source = 'nominatim';
      }

      if (type === SearchType.WEB && source === 'google' && (!response.organic || response.organic.length === 0)) {
        const ddgHtml = await this.fetchDuckDuckGo(dto.q);
        if (ddgHtml) {
          source = 'duckduckgo';
          response = await this.parseResults(type, ddgHtml, num, {
            q: dto.q,
            gl,
            hl,
            engine: 'duckduckgo',
            page,
            num,
          }, source);
        }
      }

      if (
        type === SearchType.IMAGES &&
        source === 'google' &&
        (!response.images || response.images.length === 0)
      ) {
        this.logger.warn('Google Images vazio — fallback DuckDuckGo Images');
        response = await this.buildDdgImagesResponse(dto.q, gl, hl, num, page);
        source = 'duckduckgo';
      }
    }

    response.searchParameters.engine = source;
    const normalized = await this.aiService.normalizeResults((response.organic || []) as WebResult[]);
    response.organic = normalized as WebResult[];
    response.cached = false;
    response.responseTime = Date.now() - start;
    response.credits = operationCost;

    await this.cacheService.set(cacheKey, response);
    if (!options?.skipBilling) {
      await this.creditsService.deduct(user, operationCost);
    }
    await this.logUsage(user, type, dto.q, gl, hl, device, response.responseTime, false, true, undefined, operationCost);

    this.metrics.searchRequestsTotal.inc({ type, cached: 'false', success: 'true' });
    this.metrics.searchDuration.observe({ type }, response.responseTime / 1000);

    return response;
  }

  private extractUrlOptions(dto: BaseSearchDto): SearchUrlOptions {
    const maps = dto as MapsSearchDto;
    const places = dto as PlacesSearchDto;
    const images = dto as ImagesSearchDto;
    const news = dto as NewsSearchDto;

    return {
      lat: maps.lat,
      lng: maps.lng,
      radius: maps.radius,
      placeType: places.placeType,
      imageSize: images.size,
      imageType: images.type,
      newsTbs: news.tbs,
    };
  }

  private getWaitSelector(type: SearchType): string | undefined {
    if (type === SearchType.MAPS || type === SearchType.PLACES) {
      return 'a[href*="/maps/place"], div[role="article"], .Nv2PK';
    }
    if (type === SearchType.IMAGES) return 'img[data-src], img[src]';
    if (type === SearchType.NEWS) return 'article, g-card';
    if (type === SearchType.SHOPPING) return 'div.sh-dgr__content, g-inner-card';
    if (type === SearchType.VIDEOS) return 'div.g, g-scrolling-carousel';
    return undefined;
  }

  private async buildDdgImagesResponse(
    query: string,
    gl: string,
    hl: string,
    num: number,
    page: number,
  ): Promise<SearchResponse> {
    const images = await this.ddgImages.searchImages(query, num, gl, hl, page);

    return {
      searchParameters: {
        q: query,
        gl,
        hl,
        type: 'images',
        engine: 'duckduckgo',
        page,
        num,
      },
      images,
      credits: getSearchCreditCost(SearchType.IMAGES),
      cached: false,
      responseTime: 0,
    };
  }

  private async buildNominatimResponse(
    type: SearchType,
    query: string,
    hl: string,
    num: number,
    page: number,
    urlOptions: SearchUrlOptions,
  ): Promise<SearchResponse> {
    let searchQuery = query;
    if (urlOptions.placeType) {
      const typeMap: Record<string, string> = {
        restaurant: 'restaurante',
        hotel: 'hotel',
        business: 'empresa',
        store: 'loja',
      };
      searchQuery = `${typeMap[urlOptions.placeType] ?? urlOptions.placeType} ${query}`;
    }

    const places = await this.nominatim.searchPlaces(searchQuery, num, hl, urlOptions);

    return {
      searchParameters: {
        q: query,
        gl: 'br',
        hl,
        type: type.toLowerCase(),
        engine: 'nominatim',
        page,
        num,
      },
      places,
      credits: getSearchCreditCost(type),
      cached: false,
      responseTime: 0,
    };
  }

  private async fetchDuckDuckGo(query: string): Promise<string | null> {
    try {
      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await fetch(ddgUrl, {
        headers: {
          'User-Agent': this.browserService.randomUserAgent(),
          Accept: 'text/html',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
      });
      if (response.ok) return response.text();
    } catch (error) {
      this.logger.warn(`DuckDuckGo fallback falhou: ${error}`);
    }
    return null;
  }

  async batchSearch(
    user: AuthenticatedUser,
    queries: Array<{ type: string; q: string; gl?: string; hl?: string; num?: number }>,
  ): Promise<BatchSearchResponse> {
    const start = Date.now();
    const totalCreditsNeeded = queries.reduce(
      (sum, query) => sum + getSearchCreditCost(this.mapSearchType(query.type)),
      0,
    );
    void totalCreditsNeeded;

    const results = await Promise.allSettled(
      queries.map(async (query, index) => {
        const searchType = this.mapSearchType(query.type);
        const data = await this.search(user, searchType, query);
        return { index, type: query.type, query: query.q, success: true, data };
      }),
    );

    const batchResults = results.map((result, index) => {
      if (result.status === 'fulfilled') return result.value;
      return {
        index,
        type: queries[index].type,
        query: queries[index].q,
        success: false,
        error: result.reason?.message || 'Unknown error',
      };
    });

    return {
      results: batchResults,
      totalCredits: batchResults.reduce((sum, r) => {
        if (!r.success) return sum;
        const credits = 'data' in r && r.data?.credits != null
          ? r.data.credits
          : getSearchCreditCost(this.mapSearchType(r.type));
        return sum + credits;
      }, 0),
      responseTime: Date.now() - start,
    };
  }

  private async fetchWithRetry(
    url: string,
    country: string,
    type: SearchType,
    query?: string,
    options?: { waitForSelector?: string },
    maxRetries = 3,
  ): Promise<{ html: string; source: SearchSource }> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const proxy = this.proxyManager.getNextProxy({ country });
        const proxyUrl = proxy ? this.proxyManager.buildProxyUrl(proxy) : undefined;

        const html = await this.browserService.fetchPage({
          url,
          proxy: proxyUrl,
          userAgent: this.browserService.randomUserAgent(),
          viewport: this.browserService.randomViewport(),
          timeout: 35000,
          waitForSelector: options?.waitForSelector,
        });

        if (proxy) await this.proxyManager.reportSuccess(proxy.id, 0);
        return { html, source: 'google' };
      } catch (error) {
        lastError = error as Error;
        const proxy = this.proxyManager.getNextProxy({ country });
        if (proxy) await this.proxyManager.reportFailure(proxy.id);

        const backoff = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    if (query && supportsDuckDuckGoImagesFallback(type)) {
      this.logger.warn(`Fallback DuckDuckGo Images após falha: ${lastError?.message}`);
      return { html: '', source: 'duckduckgo' };
    }

    if (query && supportsDuckDuckGoFallback(type)) {
      const ddgHtml = await this.fetchDuckDuckGo(query);
      if (ddgHtml) {
        this.logger.warn(`Fallback DuckDuckGo (WEB) após falha: ${lastError?.message}`);
        return { html: ddgHtml, source: 'duckduckgo' };
      }
    }

    throw new BadRequestException(`Falha ao buscar resultados: ${lastError?.message}`);
  }

  private async parseResults(
    type: SearchType,
    html: string,
    num: number,
    params: { q: string; gl: string; hl: string; engine: string; page: number; num: number },
    source: SearchSource = 'google',
  ): Promise<SearchResponse> {
    const searchParameters = {
      q: params.q,
      gl: params.gl,
      hl: params.hl,
      type: type.toLowerCase(),
      engine: params.engine,
      page: params.page,
      num: params.num,
    };

    const response: SearchResponse = {
      searchParameters,
      credits: getSearchCreditCost(type),
      cached: false,
      responseTime: 0,
    };

    switch (type) {
      case SearchType.WEB:
        if (source === 'duckduckgo') {
          response.organic = this.parserFactory.getDuckDuckGoParser().parse(html, num);
        } else {
          response.organic = this.parserFactory.getGoogleParser().parse(html, num);
          response.relatedSearches = this.parserFactory.getGoogleParser().parseRelatedSearches(html);
        }
        break;
      case SearchType.NEWS:
        response.news = this.parserFactory.getNewsParser().parse(html, num);
        break;
      case SearchType.IMAGES:
        response.images = this.parserFactory.getImagesParser().parse(html, num);
        break;
      case SearchType.VIDEOS:
        response.videos = this.parserFactory.getVideosParser().parse(html, num);
        break;
      case SearchType.SHOPPING:
        response.shopping = this.parserFactory.getShoppingParser().parse(html, num);
        break;
      case SearchType.MAPS:
      case SearchType.PLACES:
        response.places = this.parserFactory.getMapsParser().parse(html, num);
        break;
      case SearchType.KNOWLEDGE_GRAPH: {
        const kg = this.parserFactory.getGoogleParser().parseKnowledgeGraph(html);
        if (kg) response.knowledgeGraph = kg;
        break;
      }
      case SearchType.RELATED_SEARCHES:
        response.relatedSearches = this.parserFactory.getGoogleParser().parseRelatedSearches(html);
        break;
      case SearchType.AUTOCOMPLETE:
        response.autocomplete = this.parseAutocomplete(html);
        break;
      default:
        response.organic = this.parserFactory.getGoogleParser().parse(html, num);
    }

    return response;
  }

  private parseAutocomplete(html: string): string[] {
    try {
      const match = html.match(/\[(\[.*?\])\]/);
      if (match) {
        const parsed = JSON.parse(match[1]) as Array<[string]>;
        return parsed.map((item) => item[0]).filter(Boolean);
      }
    } catch {
      this.logger.warn('Failed to parse autocomplete');
    }
    return [];
  }

  private mapSearchType(type: string): SearchType {
    const map: Record<string, SearchType> = {
      web: SearchType.WEB,
      images: SearchType.IMAGES,
      news: SearchType.NEWS,
      shopping: SearchType.SHOPPING,
      videos: SearchType.VIDEOS,
      maps: SearchType.MAPS,
      places: SearchType.PLACES,
    };
    return map[type] || SearchType.WEB;
  }

  private async logUsage(
    user: AuthenticatedUser,
    type: SearchType,
    query: string,
    country: string,
    language: string,
    device: string,
    responseTime: number,
    cached: boolean,
    success: boolean,
    errorMessage?: string,
    creditsUsed?: number,
  ): Promise<void> {
    await this.prisma.usageLog.create({
      data: {
        userId: user.id,
        apiKeyId: user.apiKeyId,
        searchType: type,
        query,
        country,
        language,
        device,
        creditsUsed: cached ? 0 : (creditsUsed ?? getSearchCreditCost(type)),
        responseTime,
        cached,
        success,
        errorMessage,
      },
    });
  }

  async getUsage(userId: string) {
    return this.prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        searchType: true,
        query: true,
        creditsUsed: true,
        responseTime: true,
        cached: true,
        success: true,
        createdAt: true,
      },
    });
  }
}
