import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { AdvancedApiService } from './advanced.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/auth.decorator';
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

@ApiTags('Advanced APIs')
@Controller()
@UseGuards(CombinedAuthGuard)
@ApiBearerAuth()
@ApiSecurity('api-key')
export class AdvancedApiController {
  constructor(private readonly advancedService: AdvancedApiService) {}

  @Get('capabilities')
  @ApiOperation({ summary: 'Listar APIs avançadas disponíveis' })
  capabilities() {
    return this.advancedService.listCapabilities();
  }

  @Post('crawl')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crawl API — rastrear URLs recursivamente' })
  crawl(@CurrentUser() user: AuthenticatedUser, @Body() dto: CrawlDto) {
    return this.advancedService.crawl(user, dto);
  }

  @Post('extract')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Extract API — extrair conteúdo estruturado de URL' })
  extract(@CurrentUser() user: AuthenticatedUser, @Body() dto: ExtractDto) {
    return this.advancedService.extract(user, dto);
  }

  @Post('screenshot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Screenshot API — captura de tela de página' })
  screenshot(@CurrentUser() user: AuthenticatedUser, @Body() dto: ScreenshotDto) {
    return this.advancedService.screenshot(user, dto);
  }

  @Post('pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PDF API — gerar ou extrair PDF' })
  pdf(@CurrentUser() user: AuthenticatedUser, @Body() dto: PdfDto) {
    return this.advancedService.pdf(user, dto);
  }

  @Post('research')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Research API — pesquisa com síntese de fontes' })
  research(@CurrentUser() user: AuthenticatedUser, @Body() dto: ResearchDto) {
    return this.advancedService.research(user, dto);
  }

  @Post('ai-search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI Search API — busca ranqueada por IA' })
  aiSearch(@CurrentUser() user: AuthenticatedUser, @Body() dto: AiSearchDto) {
    return this.advancedService.aiSearch(user, dto);
  }

  @Post('deep-research')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deep Research API — pesquisa multi-etapas com citações' })
  deepResearch(@CurrentUser() user: AuthenticatedUser, @Body() dto: DeepResearchDto) {
    return this.advancedService.deepResearch(user, dto);
  }

  @Post('dataset/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Dataset API — criar dataset' })
  createDataset(@CurrentUser() user: AuthenticatedUser, @Body() dto: DatasetCreateDto) {
    return this.advancedService.createDataset(user, dto);
  }

  @Post('dataset/:name/ingest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dataset API — ingerir registros' })
  ingestDataset(
    @CurrentUser() user: AuthenticatedUser,
    @Param('name') name: string,
    @Body() dto: DatasetIngestDto,
  ) {
    return this.advancedService.ingestDataset(user, name, dto);
  }

  @Post('dataset/query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dataset API — consultar dataset' })
  queryDataset(@CurrentUser() user: AuthenticatedUser, @Body() dto: DatasetQueryDto) {
    return this.advancedService.queryDataset(user, dto);
  }

  @Post('rag/index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'RAG API — indexar documento' })
  ragIndex(@CurrentUser() user: AuthenticatedUser, @Body() dto: RagIndexDto) {
    return this.advancedService.ragIndex(user, dto);
  }

  @Post('rag/query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'RAG API — busca vetorial semântica' })
  ragQuery(@CurrentUser() user: AuthenticatedUser, @Body() dto: RagQueryDto) {
    return this.advancedService.ragQuery(user, dto);
  }

  @Post('browser/navigate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Browser API — navegação automatizada para agentes' })
  browserNavigate(@CurrentUser() user: AuthenticatedUser, @Body() dto: BrowserNavigateDto) {
    return this.advancedService.browserNavigate(user, dto);
  }

  @Post('agent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Agent API — orquestra busca e síntese a partir de um goal' })
  agent(@CurrentUser() user: AuthenticatedUser, @Body() dto: AgentDto) {
    return this.advancedService.agent(user, dto);
  }

  @Post('embeddings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Embeddings API — vetores para RAG' })
  embeddings(@CurrentUser() user: AuthenticatedUser, @Body() dto: EmbeddingsDto) {
    return this.advancedService.embeddings(user, dto);
  }

  @Post('prepare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI-Ready Content — Markdown, chunks e embeddings' })
  prepare(@CurrentUser() user: AuthenticatedUser, @Body() dto: PrepareContentDto) {
    return this.advancedService.prepareContent(user, dto);
  }

  @Post('memory')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Memory API — armazenar contexto para agentes' })
  storeMemory(@CurrentUser() user: AuthenticatedUser, @Body() dto: MemoryStoreDto) {
    return this.advancedService.storeMemory(user, dto);
  }

  @Post('memory/query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Memory API — recuperar contexto' })
  getMemory(@CurrentUser() user: AuthenticatedUser, @Body() dto: MemoryQueryDto) {
    return this.advancedService.getMemory(user, dto);
  }
}
