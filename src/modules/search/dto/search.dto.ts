import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsArray,
  ValidateNested,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BaseSearchDto {
  @ApiProperty({ example: 'nestjs typescript tutorial', description: 'Termo de busca' })
  @IsString()
  q!: string;

  @ApiPropertyOptional({ example: 'br', default: 'br' })
  @IsOptional()
  @IsString()
  gl?: string;

  @ApiPropertyOptional({ example: 'pt', default: 'pt' })
  @IsOptional()
  @IsString()
  hl?: string;

  @ApiPropertyOptional({ example: 'desktop', enum: ['desktop', 'mobile', 'tablet'] })
  @IsOptional()
  @IsIn(['desktop', 'mobile', 'tablet'])
  device?: string;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  num?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 'google', default: 'google' })
  @IsOptional()
  @IsString()
  engine?: string;

  @ApiPropertyOptional({ description: 'Desabilitar cache para esta requisição' })
  @IsOptional()
  noCache?: boolean;
}

export class SearchDto extends BaseSearchDto {}

export class ImagesSearchDto extends BaseSearchDto {
  @ApiPropertyOptional({ example: 'large', enum: ['large', 'medium', 'icon'] })
  @IsOptional()
  @IsIn(['large', 'medium', 'icon'])
  size?: string;

  @ApiPropertyOptional({ example: 'photo', enum: ['photo', 'clipart', 'lineart', 'animated'] })
  @IsOptional()
  @IsIn(['photo', 'clipart', 'lineart', 'animated'])
  type?: string;
}

export class NewsSearchDto extends BaseSearchDto {
  @ApiPropertyOptional({ example: 'd', enum: ['d', 'w', 'm'] })
  @IsOptional()
  @IsIn(['d', 'w', 'm'])
  tbs?: string;
}

export class MapsSearchDto extends BaseSearchDto {
  @ApiPropertyOptional({ example: -23.5505 })
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  lat?: number;

  @ApiPropertyOptional({ example: -46.6333 })
  @IsOptional()
  @IsNumber()
  @IsLongitude()
  lng?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(100)
  radius?: number;
}

export class ReverseImageDto {
  @ApiProperty({ description: 'URL da imagem para busca reversa' })
  @IsString()
  url!: string;

  @ApiPropertyOptional({ example: 'br' })
  @IsOptional()
  @IsString()
  gl?: string;

  @ApiPropertyOptional({ example: 'pt' })
  @IsOptional()
  @IsString()
  hl?: string;
}

export class BatchSearchItemDto extends BaseSearchDto {
  @ApiProperty({ example: 'web', enum: ['web', 'images', 'news', 'shopping', 'videos'] })
  @IsIn(['web', 'images', 'news', 'shopping', 'videos'])
  type!: string;
}

export class BatchSearchDto {
  @ApiProperty({ type: [BatchSearchItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchSearchItemDto)
  queries!: BatchSearchItemDto[];
}

export class AutocompleteDto {
  @ApiProperty({ example: 'nest' })
  @IsString()
  q!: string;

  @ApiPropertyOptional({ example: 'br' })
  @IsOptional()
  @IsString()
  gl?: string;

  @ApiPropertyOptional({ example: 'pt' })
  @IsOptional()
  @IsString()
  hl?: string;
}

export class RelatedSearchesDto extends BaseSearchDto {}

export class KnowledgeGraphDto extends BaseSearchDto {}

export class PlacesSearchDto extends MapsSearchDto {
  @ApiPropertyOptional({ example: 'restaurant', enum: ['restaurant', 'hotel', 'business', 'store'] })
  @IsOptional()
  @IsIn(['restaurant', 'hotel', 'business', 'store'])
  placeType?: string;
}
