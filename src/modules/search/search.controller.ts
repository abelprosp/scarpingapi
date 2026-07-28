import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { SearchType } from '@prisma/client';
import { SearchService } from './search.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/auth.decorator';
import {
  SearchDto,
  ImagesSearchDto,
  NewsSearchDto,
  MapsSearchDto,
  ReverseImageDto,
  BatchSearchDto,
  AutocompleteDto,
  RelatedSearchesDto,
  KnowledgeGraphDto,
  PlacesSearchDto,
} from './dto/search.dto';

@ApiTags('Search')
@Controller()
@UseGuards(CombinedAuthGuard)
@ApiBearerAuth()
@ApiSecurity('api-key')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesquisa web' })
  search(@CurrentUser() user: AuthenticatedUser, @Body() dto: SearchDto) {
    return this.searchService.search(user, SearchType.WEB, dto);
  }

  @Post('images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesquisa de imagens' })
  images(@CurrentUser() user: AuthenticatedUser, @Body() dto: ImagesSearchDto) {
    return this.searchService.search(user, SearchType.IMAGES, dto);
  }

  @Post('news')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesquisa de notícias' })
  news(@CurrentUser() user: AuthenticatedUser, @Body() dto: NewsSearchDto) {
    return this.searchService.search(user, SearchType.NEWS, dto);
  }

  @Post('shopping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesquisa de shopping' })
  shopping(@CurrentUser() user: AuthenticatedUser, @Body() dto: SearchDto) {
    return this.searchService.search(user, SearchType.SHOPPING, dto);
  }

  @Post('videos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesquisa de vídeos' })
  videos(@CurrentUser() user: AuthenticatedUser, @Body() dto: SearchDto) {
    return this.searchService.search(user, SearchType.VIDEOS, dto);
  }

  @Post('maps')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesquisa de mapas' })
  maps(@CurrentUser() user: AuthenticatedUser, @Body() dto: MapsSearchDto) {
    return this.searchService.search(user, SearchType.MAPS, dto);
  }

  @Post('places')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesquisa de locais' })
  places(@CurrentUser() user: AuthenticatedUser, @Body() dto: PlacesSearchDto) {
    return this.searchService.search(user, SearchType.PLACES, dto);
  }

  @Post('autocomplete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autocomplete em tempo real' })
  autocomplete(@CurrentUser() user: AuthenticatedUser, @Body() dto: AutocompleteDto) {
    return this.searchService.search(user, SearchType.AUTOCOMPLETE, dto);
  }

  @Post('related-searches')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pesquisas relacionadas' })
  relatedSearches(@CurrentUser() user: AuthenticatedUser, @Body() dto: RelatedSearchesDto) {
    return this.searchService.search(user, SearchType.RELATED_SEARCHES, dto);
  }

  @Post('knowledge-graph')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Knowledge Graph' })
  knowledgeGraph(@CurrentUser() user: AuthenticatedUser, @Body() dto: KnowledgeGraphDto) {
    return this.searchService.search(user, SearchType.KNOWLEDGE_GRAPH, dto);
  }

  @Post('reverse-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Busca reversa de imagem' })
  reverseImage(@CurrentUser() user: AuthenticatedUser, @Body() dto: ReverseImageDto) {
    return this.searchService.search(user, SearchType.REVERSE_IMAGE, { q: dto.url, gl: dto.gl, hl: dto.hl });
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Busca em lote (batch)' })
  batch(@CurrentUser() user: AuthenticatedUser, @Body() dto: BatchSearchDto) {
    return this.searchService.batchSearch(user, dto.queries);
  }

  @Get('credits')
  @ApiOperation({ summary: 'Consultar créditos disponíveis' })
  async credits(@CurrentUser() user: AuthenticatedUser) {
    return { credits: user.credits, userId: user.id };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Consultar histórico de uso' })
  usage(@CurrentUser() user: AuthenticatedUser) {
    return this.searchService.getUsage(user.id);
  }
}
