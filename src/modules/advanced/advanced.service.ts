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
  AgentDto,
  EmbeddingsDto,
  PrepareContentDto,
  MemoryStoreDto,
  MemoryQueryDto,
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

    const synthesis = await this.aiService.synthesizeResearch({
      query: dto.query,
      sources,
    });

    const report = {
      query: dto.query,
      summary: synthesis.summary,
      keyFindings: synthesis.keyFindings,
      timeline: synthesis.timeline,
      people: synthesis.people,
      companies: synthesis.companies,
      conclusions: synthesis.conclusions,
      sources,
      llm: this.aiService.llmAvailable,
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

    const synthesis = await this.aiService.synthesizeResearch({
      query: dto.query,
      sources: uniqueCitations.map((c) => ({
        title: c.title,
        url: c.url,
        snippet: c.snippet,
      })),
    });

    const report = {
      query: dto.query,
      steps: stepReports.join('\n\n'),
      summary: synthesis.summary,
      keyFindings: synthesis.keyFindings,
      timeline: synthesis.timeline,
      people: synthesis.people,
      companies: synthesis.companies,
      conclusions: synthesis.conclusions,
      conclusion: synthesis.conclusions.join(' ') || synthesis.summary.slice(0, 2000),
      citations: uniqueCitations,
      citationCount: uniqueCitations.length,
      llm: this.aiService.llmAvailable,
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

  async agent(user: AuthenticatedUser, dto: AgentDto) {
    const cost = this.credits.costFor('agent');
    await this.credits.deduct(user, cost, 'agent');

    const maxSteps = dto.maxSteps ?? 3;
    const planned = (await this.aiService.planAgentSteps(dto.goal)).slice(0, maxSteps);
    const findings: Array<{
      step: number;
      query: string;
      results: Array<{ title: string; url: string; snippet?: string }>;
    }> = [];

    for (let i = 0; i < planned.length; i++) {
      const query = planned[i];
      const search = await this.searchService.search(
        user,
        SearchType.WEB,
        { q: query, gl: dto.gl ?? 'br', hl: dto.hl ?? 'pt', num: 6, noCache: true },
        { skipBilling: true },
      );
      const organic = (search.organic ?? []) as WebResult[];
      findings.push({
        step: i + 1,
        query,
        results: organic.slice(0, 5).map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.description,
        })),
      });
    }

    const flatSources = findings.flatMap((f) => f.results);
    const synthesis = await this.aiService.synthesizeResearch({
      query: dto.goal,
      sources: flatSources,
    });

    const report = {
      goal: dto.goal,
      plan: planned,
      findings,
      summary: synthesis.summary,
      keyFindings: synthesis.keyFindings,
      companies: synthesis.companies,
      people: synthesis.people,
      conclusions: synthesis.conclusions,
      sources: flatSources,
      llm: this.aiService.llmAvailable,
    };

    const session = await this.prisma.researchSession.create({
      data: {
        userId: user.id,
        query: dto.goal,
        status: 'COMPLETED',
        depth: planned.length,
        report: report as unknown as object,
        citations: flatSources as unknown as object,
        creditsUsed: cost,
        completedAt: new Date(),
      },
    });

    return { sessionId: session.id, ...report, credits: cost };
  }

  async embeddings(user: AuthenticatedUser, dto: EmbeddingsDto) {
    const cost = this.credits.costFor('embeddings');
    await this.credits.deduct(user, cost, 'embeddings');

    const input = dto.input.slice(0, 32);
    const vectors = await this.aiService.embedTexts(input);

    return {
      model: this.aiService.llmAvailable
        ? process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
        : 'noviq-hash-v1',
      dimensions: vectors[0]?.length ?? 0,
      embeddings: vectors,
      count: vectors.length,
      credits: cost,
    };
  }

  async prepareContent(user: AuthenticatedUser, dto: PrepareContentDto) {
    const cost = this.credits.costFor('prepare');
    await this.credits.deduct(user, cost, 'prepare');

    const html = await this.browser.fetchPage({ url: dto.url });
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    const author =
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      '';
    const description = $('meta[name="description"]').attr('content') ?? '';
    const language = $('html').attr('lang') ?? (await this.aiService.detectLanguage(title));
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 50000);
    const markdown = `# ${title}\n\n${description ? `> ${description}\n\n` : ''}${text}`;

    const chunks =
      dto.includeChunks === false ? [] : chunkText(markdown, 1000, 100).slice(0, 40);
    let embeddings: number[][] | undefined;
    if (dto.includeEmbeddings && chunks.length > 0) {
      embeddings = await this.aiService.embedTexts(chunks.slice(0, 16));
    }

    return {
      url: dto.url,
      title,
      author,
      summary: await this.aiService.summarize(text || description || title, 400),
      content: text,
      markdown,
      language,
      categories: await this.aiService.extractEntities(`${title} ${description}`),
      chunks,
      embeddings,
      credits: cost,
    };
  }

  async storeMemory(user: AuthenticatedUser, dto: MemoryStoreDto) {
    const cost = this.credits.costFor('memory');
    await this.credits.deduct(user, cost, 'memory');

    const dataset = await this.ensureMemoryDataset(user.id);
    await this.prisma.datasetRecord.create({
      data: {
        datasetId: dataset.id,
        data: {
          key: dto.key,
          context: dto.context as object,
          storedAt: new Date().toISOString(),
        } as object,
      },
    });
    await this.prisma.dataset.update({
      where: { id: dataset.id },
      data: { recordCount: { increment: 1 } },
    });

    return { key: dto.key, stored: true, credits: cost };
  }

  async getMemory(user: AuthenticatedUser, dto: MemoryQueryDto) {
    const cost = this.credits.costFor('memory');
    await this.credits.deduct(user, cost, 'memory');

    const dataset = await this.ensureMemoryDataset(user.id);
    const records = await this.prisma.datasetRecord.findMany({
      where: { datasetId: dataset.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const matches = records
      .map((r) => r.data as { key?: string; context?: Record<string, unknown>; storedAt?: string })
      .filter((d) => d.key === dto.key);

    return {
      key: dto.key,
      entries: matches,
      credits: cost,
    };
  }

  private async ensureMemoryDataset(userId: string) {
    const name = '__agent_memory__';
    const existing = await this.prisma.dataset.findFirst({ where: { userId, name } });
    if (existing) return existing;
    return this.prisma.dataset.create({
      data: {
        userId,
        name,
        description: 'Memória de contexto para agentes Noviq',
        isPublic: false,
      },
    });
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
      positioning: 'Infraestrutura brasileira de recuperação de conhecimento para agentes de IA',
      llmEnabled: this.aiService.llmAvailable,
      apis: [
        { name: 'Search API', endpoint: 'POST /search', status: 'active' },
        { name: 'Images API', endpoint: 'POST /images', status: 'active' },
        { name: 'Videos API', endpoint: 'POST /videos', status: 'active' },
        { name: 'News API', endpoint: 'POST /news', status: 'active' },
        { name: 'Shopping API', endpoint: 'POST /shopping', status: 'active' },
        { name: 'Maps API', endpoint: 'POST /maps', status: 'active' },
        { name: 'Research API', endpoint: 'POST /research', status: 'active' },
        { name: 'Deep Research API', endpoint: 'POST /deep-research', status: 'active' },
        { name: 'Agent API', endpoint: 'POST /agent', status: 'active' },
        { name: 'AI Search API', endpoint: 'POST /ai-search', status: 'active' },
        { name: 'Crawl API', endpoint: 'POST /crawl', status: 'active' },
        { name: 'Extract API', endpoint: 'POST /extract', status: 'active' },
        { name: 'Prepare Content API', endpoint: 'POST /prepare', status: 'active' },
        { name: 'Embeddings API', endpoint: 'POST /embeddings', status: 'active' },
        { name: 'Memory API', endpoint: 'POST /memory', status: 'active' },
        { name: 'Screenshot API', endpoint: 'POST /screenshot', status: 'active' },
        { name: 'PDF API', endpoint: 'POST /pdf', status: 'active' },
        { name: 'Dataset API', endpoint: 'POST /dataset/*', status: 'active' },
        { name: 'RAG API', endpoint: 'POST /rag/*', status: 'active' },
        { name: 'Browser API', endpoint: 'POST /browser/navigate', status: 'active' },
      ],
    };
  }
}
