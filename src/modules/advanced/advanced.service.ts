import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { BrowserService } from '../browser/browser.service';
import { SearchService } from '../search/search.service';
import { AiService } from '../ai/ai.service';
import { AdvancedCreditsService } from './common/advanced-credits.service';
import { chunkText, cosineSimilarity, simpleEmbed } from './common/embedding.util';
import { AuthenticatedUser } from '../../common/decorators/auth.decorator';
import { WebResult } from '../search/interfaces/search-result.interface';
import { SearchType } from '@prisma/client';
import {
  CrawlDto,
  ExtractDto,
  ScreenshotDto,
  PdfDto,
  ResearchDto,
  AiSearchDto,
  DeepResearchDto,
  DatasetCreateDto,
  DatasetIngestDto,
  DatasetQueryDto,
  RagIndexDto,
  RagQueryDto,
  BrowserNavigateDto,
} from './dto/advanced.dto';

@Injectable()
export class AdvancedApiService {
  private readonly logger = new Logger(AdvancedApiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly browser: BrowserService,
    private readonly searchService: SearchService,
    private readonly aiService: AiService,
    private readonly credits: AdvancedCreditsService,
  ) {}

  async crawl(user: AuthenticatedUser, dto: CrawlDto) {
    const cost = this.credits.costFor('crawl');
    await this.credits.deduct(user, cost, 'crawl');

    const maxDepth = dto.maxDepth ?? 2;
    const maxPages = dto.maxPages ?? 50;
    const visited = new Set<string>();
    const results: Array<{ url: string; title: string; depth: number }> = [];
    const queue: Array<{ url: string; depth: number }> = [{ url: dto.url, depth: 0 }];

    while (queue.length > 0 && results.length < maxPages) {
      const current = queue.shift()!;
      if (visited.has(current.url) || current.depth > maxDepth) continue;
      visited.add(current.url);

      try {
        const html = await this.browser.fetchPage({ url: current.url, timeout: 20000 });
        const $ = cheerio.load(html);
        const title = $('title').text().trim() || current.url;
        results.push({ url: current.url, title, depth: current.depth });

        if (current.depth < maxDepth) {
          $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;
            try {
              const absolute = new URL(href, current.url).href;
              if (absolute.startsWith('http') && !visited.has(absolute)) {
                queue.push({ url: absolute, depth: current.depth + 1 });
              }
            } catch {
              /* invalid url */
            }
          });
        }
      } catch (error) {
        this.logger.warn(`Crawl failed for ${current.url}: ${error}`);
      }
    }

    const job = await this.prisma.crawlJob.create({
      data: {
        userId: user.id,
        seedUrl: dto.url,
        status: 'COMPLETED',
        maxDepth,
        maxPages,
        pagesFound: results.length,
        results: results as unknown as object,
        completedAt: new Date(),
      },
    });

    return { jobId: job.id, pagesFound: results.length, pages: results, credits: cost };
  }

  async extract(user: AuthenticatedUser, dto: ExtractDto) {
    const cost = this.credits.costFor('extract');
    await this.credits.deduct(user, cost, 'extract');

    const html = await this.browser.fetchPage({ url: dto.url });
    const $ = cheerio.load(html);

    const scope = dto.selector ? $(dto.selector) : $('body');
    const text = scope.text().replace(/\s+/g, ' ').trim();

    const links: Array<{ text: string; href: string }> = [];
    if (dto.includeLinks !== false) {
      scope.find('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const linkText = $(el).text().trim();
        if (href && linkText) {
          try {
            links.push({ text: linkText, href: new URL(href, dto.url).href });
          } catch {
            /* skip */
          }
        }
      });
    }

    const metadata: Record<string, string> = {};
    if (dto.includeMetadata !== false) {
      metadata.title = $('title').text().trim();
      metadata.description = $('meta[name="description"]').attr('content') ?? '';
      metadata.ogTitle = $('meta[property="og:title"]').attr('content') ?? '';
      metadata.ogImage = $('meta[property="og:image"]').attr('content') ?? '';
      metadata.canonical = $('link[rel="canonical"]').attr('href') ?? '';
      metadata.language = $('html').attr('lang') ?? '';
    }

    return {
      url: dto.url,
      title: metadata.title,
      text: text.slice(0, 50000),
      wordCount: text.split(/\s+/).length,
      links: links.slice(0, 100),
      metadata,
      credits: cost,
    };
  }

  async screenshot(user: AuthenticatedUser, dto: ScreenshotDto) {
    const cost = this.credits.costFor('screenshot');
    await this.credits.deduct(user, cost, 'screenshot');

    const buffer = await this.browser.screenshot({
      url: dto.url,
      fullPage: dto.fullPage,
      viewport: { width: dto.width ?? 1920, height: dto.height ?? 1080 },
    });

    return {
      url: dto.url,
      format: 'png',
      base64: buffer.toString('base64'),
      size: buffer.length,
      credits: cost,
    };
  }

  async pdf(user: AuthenticatedUser, dto: PdfDto) {
    const cost = this.credits.costFor('pdf');
    await this.credits.deduct(user, cost, 'pdf');

    if (dto.generateFromHtml) {
      const buffer = await this.browser.generatePdfFromUrl(dto.url);
      return {
        url: dto.url,
        format: 'pdf',
        base64: buffer.toString('base64'),
        size: buffer.length,
        credits: cost,
      };
    }

    const response = await fetch(dto.url);
    if (!response.ok) throw new BadRequestException('Falha ao baixar PDF');

    const contentType = response.headers.get('content-type') ?? '';
    const buffer = Buffer.from(await response.arrayBuffer());

    if (contentType.includes('pdf')) {
      return {
        url: dto.url,
        format: 'pdf',
        base64: buffer.toString('base64'),
        size: buffer.length,
        text: '[Use generateFromHtml:true para HTML ou integre OCR]',
        credits: cost,
      };
    }

    const html = buffer.toString('utf-8');
    const $ = cheerio.load(html);
    return {
      url: dto.url,
      format: 'html-extract',
      text: $('body').text().replace(/\s+/g, ' ').trim().slice(0, 100000),
      credits: cost,
    };
  }

  async research(user: AuthenticatedUser, dto: ResearchDto) {
    const cost = this.credits.costFor('research');
    await this.credits.deduct(user, cost, 'research');

    const searchResult = await this.searchService.search(
      user,
      SearchType.WEB,
      { q: dto.query, gl: dto.gl ?? 'br', hl: dto.hl ?? 'pt', num: dto.numSources ?? 10, noCache: true },
      { skipBilling: true },
    );

    const organic = (searchResult.organic ?? []) as WebResult[];
    const sources = organic.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
    }));

    const summaries = await Promise.all(
      sources.slice(0, 5).map(async (s) => ({
        ...s,
        summary: await this.aiService.summarize(s.snippet ?? s.title, 300),
      })),
    );

    const report = {
      query: dto.query,
      summary: summaries.map((s) => s.summary).join('\n\n'),
      keyFindings: await this.aiService.extractEntities(summaries.map((s) => s.title).join(' ')),
      sources: summaries,
    };

    const session = await this.prisma.researchSession.create({
      data: {
        userId: user.id,
        query: dto.query,
        status: 'COMPLETED',
        report: report as unknown as object,
        citations: sources as unknown as object,
        creditsUsed: cost,
        completedAt: new Date(),
      },
    });

    return { sessionId: session.id, ...report, credits: cost };
  }

  async aiSearch(user: AuthenticatedUser, dto: AiSearchDto) {
    const cost = this.credits.costFor('ai-search');
    await this.credits.deduct(user, cost, 'ai-search');

    const result = await this.searchService.search(
      user,
      SearchType.WEB,
      { q: dto.q, gl: dto.gl ?? 'br', hl: dto.hl ?? 'pt', num: dto.num ?? 10 },
      { skipBilling: true },
    );

    const organic = (result.organic ?? []) as Array<{ title: string; description?: string; url: string; position: number }>;
    const scores = await this.aiService.classifyRelevance(dto.q, organic);
    const ranked = organic
      .map((item, i) => ({ ...item, relevanceScore: scores[i] }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const normalized = await this.aiService.normalizeResults(ranked);

    return {
      query: dto.q,
      instructions: dto.instructions,
      results: normalized,
      searchParameters: result.searchParameters,
      credits: cost,
    };
  }

  async deepResearch(user: AuthenticatedUser, dto: DeepResearchDto) {
    const cost = this.credits.costFor('deep-research');
    await this.credits.deduct(user, cost, 'deep-research');

    const steps = dto.steps ?? 3;
    const allCitations: Array<{ title: string; url: string; snippet: string; step: number }> = [];
    const stepReports: string[] = [];
    let currentQuery = dto.query;

    for (let step = 1; step <= steps; step++) {
      const search = await this.searchService.search(
        user,
        SearchType.WEB,
        { q: currentQuery, gl: dto.gl ?? 'br', hl: dto.hl ?? 'pt', num: 8, noCache: true },
        { skipBilling: true },
      );

      const organic = (search.organic ?? []) as Array<{ title: string; description?: string; url: string }>;
      for (const r of organic.slice(0, 5)) {
        allCitations.push({
          title: r.title,
          url: r.url,
          snippet: r.description ?? '',
          step,
        });
      }

      const stepSummary = organic
        .slice(0, 3)
        .map((r) => `- ${r.title}: ${r.description ?? ''}`)
        .join('\n');
      stepReports.push(`## Etapa ${step}: ${currentQuery}\n${stepSummary}`);

      const related = search.relatedSearches ?? [];
      if (related.length > 0) {
        currentQuery = related[0];
      }
    }

    const uniqueCitations = allCitations.filter(
      (c, i, arr) => arr.findIndex((x) => x.url === c.url) === i,
    );

    const report = {
      query: dto.query,
      steps: stepReports.join('\n\n'),
      conclusion: stepReports.join(' ').slice(0, 2000),
      citations: uniqueCitations,
      citationCount: uniqueCitations.length,
    };

    const session = await this.prisma.researchSession.create({
      data: {
        userId: user.id,
        query: dto.query,
        status: 'COMPLETED',
        depth: steps,
        report: report as unknown as object,
        citations: uniqueCitations as unknown as object,
        creditsUsed: cost,
        completedAt: new Date(),
      },
    });

    return { sessionId: session.id, ...report, credits: cost };
  }

  async createDataset(user: AuthenticatedUser, dto: DatasetCreateDto) {
    return this.prisma.dataset.create({
      data: {
        userId: user.id,
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async ingestDataset(user: AuthenticatedUser, datasetName: string, dto: DatasetIngestDto) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { name: datasetName, userId: user.id },
    });
    if (!dataset) throw new NotFoundException('Dataset não encontrado');

    await this.prisma.datasetRecord.createMany({
      data: dto.records.map((data) => ({ datasetId: dataset.id, data: data as object })),
    });

    await this.prisma.dataset.update({
      where: { id: dataset.id },
      data: { recordCount: { increment: dto.records.length } },
    });

    return { dataset: datasetName, ingested: dto.records.length };
  }

  async queryDataset(user: AuthenticatedUser, dto: DatasetQueryDto) {
    const cost = this.credits.costFor('dataset-query');
    await this.credits.deduct(user, cost, 'dataset-query');

    const dataset = await this.prisma.dataset.findFirst({
      where: {
        name: dto.dataset,
        OR: [{ userId: user.id }, { isPublic: true }],
      },
    });
    if (!dataset) throw new NotFoundException('Dataset não encontrado');

    const records = await this.prisma.datasetRecord.findMany({
      where: { datasetId: dataset.id },
      take: dto.limit ?? 50,
    });

    let filtered = records;
    if (dto.filter) {
      filtered = records.filter((r) => {
        const data = r.data as Record<string, unknown>;
        return Object.entries(dto.filter!).every(([k, v]) => data[k] === v);
      });
    }

    return {
      dataset: dto.dataset,
      count: filtered.length,
      records: filtered.map((r) => r.data),
      credits: cost,
    };
  }

  async ragIndex(user: AuthenticatedUser, dto: RagIndexDto) {
    const cost = this.credits.costFor('rag-index');
    await this.credits.deduct(user, cost, 'rag-index');

    let collection = await this.prisma.ragCollection.findUnique({
      where: { userId_name: { userId: user.id, name: dto.collection } },
    });

    if (!collection) {
      collection = await this.prisma.ragCollection.create({
        data: { userId: user.id, name: dto.collection },
      });
    }

    const chunks = chunkText(dto.content);
    const docs = await Promise.all(
      chunks.map((content, i) =>
        this.prisma.ragDocument.create({
          data: {
            collectionId: collection!.id,
            content,
            metadata: (dto.metadata ?? {}) as object,
            embedding: simpleEmbed(content),
            chunkIndex: i,
          },
        }),
      ),
    );

    await this.prisma.ragCollection.update({
      where: { id: collection.id },
      data: { docCount: { increment: docs.length } },
    });

    return { collection: dto.collection, chunksIndexed: docs.length, credits: cost };
  }

  async ragQuery(user: AuthenticatedUser, dto: RagQueryDto) {
    const cost = this.credits.costFor('rag-query');
    await this.credits.deduct(user, cost, 'rag-query');

    const collection = await this.prisma.ragCollection.findUnique({
      where: { userId_name: { userId: user.id, name: dto.collection } },
      include: { documents: true },
    });
    if (!collection) throw new NotFoundException('Coleção RAG não encontrada');

    const queryEmbedding = simpleEmbed(dto.query);
    const topK = dto.topK ?? 5;

    const ranked = collection.documents
      .map((doc) => ({
        content: doc.content,
        metadata: doc.metadata,
        score: cosineSimilarity(queryEmbedding, (doc.embedding as number[]) ?? []),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const context = ranked.map((r) => r.content).join('\n\n');
    const answer = await this.aiService.summarize(context, 500);

    return {
      collection: dto.collection,
      query: dto.query,
      answer,
      sources: ranked,
      credits: cost,
    };
  }

  async browserNavigate(user: AuthenticatedUser, dto: BrowserNavigateDto) {
    const cost = this.credits.costFor('browser');
    await this.credits.deduct(user, cost, 'browser');

    const result = await this.browser.navigateAndInteract({
      url: dto.url,
      actions: dto.actions,
    });

    return { ...result, credits: cost };
  }

  listCapabilities() {
    return {
      apis: [
        { name: 'Search API', endpoint: 'POST /search', status: 'active' },
        { name: 'Research API', endpoint: 'POST /research', status: 'active' },
        { name: 'Crawl API', endpoint: 'POST /crawl', status: 'active' },
        { name: 'Extract API', endpoint: 'POST /extract', status: 'active' },
        { name: 'Screenshot API', endpoint: 'POST /screenshot', status: 'active' },
        { name: 'PDF API', endpoint: 'POST /pdf', status: 'active' },
        { name: 'Maps API', endpoint: 'POST /maps', status: 'active' },
        { name: 'News API', endpoint: 'POST /news', status: 'active' },
        { name: 'Shopping API', endpoint: 'POST /shopping', status: 'active' },
        { name: 'AI Search API', endpoint: 'POST /ai-search', status: 'active' },
        { name: 'Deep Research API', endpoint: 'POST /deep-research', status: 'active' },
        { name: 'Dataset API', endpoint: 'POST /dataset/*', status: 'active' },
        { name: 'RAG API', endpoint: 'POST /rag/*', status: 'active' },
        { name: 'Browser API', endpoint: 'POST /browser/navigate', status: 'active' },
      ],
    };
  }
}
