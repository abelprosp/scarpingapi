import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/auth.decorator';
import { UsersService } from './users.service';
import { CreditsService } from '../credits/credits.service';
import { UpdateUserSettingsDto } from './dto/user-settings.dto';

@ApiTags('Account')
@Controller('users/me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly creditsService: CreditsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Perfil completo do usuário' })
  profile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.id);
  }

  @Get('billing-status')
  @ApiOperation({ summary: 'Status de billing, créditos e consumo mensal' })
  billingStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.creditsService.getBillingStatus(user.id);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Atualizar configurações (consumo avulso)' })
  updateSettings(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateUserSettingsDto) {
    return this.creditsService.updateSettings(user.id, dto.payAsYouGoEnabled);
  }
}
