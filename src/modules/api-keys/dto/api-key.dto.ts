import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Production Key' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  rateLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
