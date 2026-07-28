import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/auth.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(CombinedAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Visão geral do sistema' })
  overview(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getOverview(user.role);
  }

  @Get('users')
  @ApiOperation({ summary: 'Listar usuários' })
  users(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getUsers(user.role, page, limit);
  }

  @Get('usage-by-endpoint')
  @ApiOperation({ summary: 'Uso por endpoint' })
  usageByEndpoint(@CurrentUser() user: AuthenticatedUser, @Query('days') days?: number) {
    return this.dashboardService.getUsageByEndpoint(user.role, days);
  }

  @Get('latency-heatmap')
  @ApiOperation({ summary: 'Mapa de calor de latência' })
  latencyHeatmap(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getLatencyHeatmap(user.role);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Logs de auditoria' })
  auditLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getAuditLogs(user.role, page, limit);
  }
}
