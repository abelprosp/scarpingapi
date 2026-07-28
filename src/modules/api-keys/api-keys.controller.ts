import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/api-key.dto';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/auth.decorator';

@ApiTags('API Keys')
@Controller('api-keys')
@UseGuards(CombinedAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova API Key' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar API Keys' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.apiKeysService.list(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revogar API Key' })
  revoke(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.apiKeysService.revoke(user.id, id);
  }
}
