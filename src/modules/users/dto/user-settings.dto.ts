import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserSettingsDto {
  @ApiProperty({ description: 'Ativar cobrança avulsa após esgotar créditos mensais' })
  @IsBoolean()
  payAsYouGoEnabled!: boolean;
}
