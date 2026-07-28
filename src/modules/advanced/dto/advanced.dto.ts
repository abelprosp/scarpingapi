import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUrl,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrawlDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ default: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxDepth?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  maxPages?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  async?: boolean;
}

export class ExtractDto {
  @ApiProperty({ example: 'https://example.com/article' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ description: 'Seletor CSS específico' })
  @IsOptional()
  @IsString()
  selector?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeLinks?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;
}

export class ScreenshotDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  fullPage?: boolean;

  @ApiPropertyOptional({ default: 1920 })
  @IsOptional()
  @IsInt()
  width?: number;

  @ApiPropertyOptional({ default: 1080 })
  @IsOptional()
  @IsInt()
  height?: number;
}

export class PdfDto {
  @ApiProperty({ description: 'URL de página web ou PDF', example: 'https://example.com/report' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ description: 'Gerar PDF a partir de página HTML' })
  @IsOptional()
  @IsBoolean()
  generateFromHtml?: boolean;
}

export class ResearchDto {
  @ApiProperty({ example: 'mercado imobiliário lajeado 2026' })
  @IsString()
  query!: string;

  @ApiPropertyOptional({ default: 'br' })
  @IsOptional()
  @IsString()
  gl?: string;

  @ApiPropertyOptional({ default: 'pt' })
  @IsOptional()
  @IsString()
  hl?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(30)
  numSources?: number;
}

export class AiSearchDto {
  @ApiProperty({ example: 'melhor framework backend nodejs 2026' })
  @IsString()
  q!: string;

  @ApiPropertyOptional({ default: 'br' })
  @IsOptional()
  @IsString()
  gl?: string;

  @ApiPropertyOptional({ default: 'pt' })
  @IsOptional()
  @IsString()
  hl?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  num?: number;

  @ApiPropertyOptional({ description: 'Instruções extras para ranking IA' })
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class DeepResearchDto {
  @ApiProperty({ example: 'impacto da IA no mercado imobiliário brasileiro' })
  @IsString()
  query!: string;

  @ApiPropertyOptional({ default: 3, description: 'Etapas de pesquisa' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  steps?: number;

  @ApiPropertyOptional({ default: 'br' })
  @IsOptional()
  @IsString()
  gl?: string;

  @ApiPropertyOptional({ default: 'pt' })
  @IsOptional()
  @IsString()
  hl?: string;
}

export class DatasetCreateDto {
  @ApiProperty({ example: 'imoveis-lajeado' })
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class DatasetIngestDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  records!: Record<string, unknown>[];
}

export class DatasetQueryDto {
  @ApiProperty({ example: 'imoveis-lajeado' })
  @IsString()
  dataset!: string;

  @ApiPropertyOptional({ example: { bairro: 'Igrejinha', quartos: 2 } })
  @IsOptional()
  @IsObject()
  filter?: Record<string, unknown>;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Max(500)
  limit?: number;
}

export class RagIndexDto {
  @ApiProperty({ example: 'docs-produto' })
  @IsString()
  collection!: string;

  @ApiProperty({ example: 'Conteúdo do documento para indexar...' })
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class RagQueryDto {
  @ApiProperty({ example: 'docs-produto' })
  @IsString()
  collection!: string;

  @ApiProperty({ example: 'Como funciona a autenticação?' })
  @IsString()
  query!: string;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  topK?: number;
}

export class BrowserActionDto {
  @ApiProperty({ enum: ['click', 'fill', 'wait', 'scroll'] })
  @IsIn(['click', 'fill', 'wait', 'scroll'])
  type!: 'click' | 'fill' | 'wait' | 'scroll';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selector?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  wait?: number;
}

export class BrowserNavigateDto {
  @ApiProperty({ example: 'https://example.com/login' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ type: [BrowserActionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrowserActionDto)
  actions?: BrowserActionDto[];
}
