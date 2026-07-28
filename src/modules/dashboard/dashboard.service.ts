import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { MetricsService } from '../../infrastructure/monitoring/metrics.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
  ) {}

  private assertAdmin(role: string) {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
  }

  async getOverview(role: string) {
    this.assertAdmin(role);

    const [totalUsers, totalSearches, activeKeys, totalCredits] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.usageLog.count(),
      this.prisma.apiKey.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.aggregate({ _sum: { credits: true } }),
    ]);

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSearches = await this.prisma.usageLog.count({
      where: { createdAt: { gte: last24h } },
    });

    const avgLatency = await this.prisma.usageLog.aggregate({
      _avg: { responseTime: true },
      where: { createdAt: { gte: last24h } },
    });

    const errorRate = await this.prisma.usageLog.groupBy({
      by: ['success'],
      _count: true,
      where: { createdAt: { gte: last24h } },
    });

    return {
      totalUsers,
      totalSearches,
      activeApiKeys: activeKeys,
      totalCreditsRemaining: totalCredits._sum.credits ?? 0,
      last24h: {
        searches: recentSearches,
        avgLatencyMs: Math.round(avgLatency._avg.responseTime ?? 0),
        errorRate: errorRate,
      },
    };
  }

  async getUsers(role: string, page = 1, limit = 20) {
    this.assertAdmin(role);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          credits: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { apiKeys: true, usageLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total, page, limit };
  }

  async getUsageByEndpoint(role: string, days = 7) {
    this.assertAdmin(role);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.prisma.usageLog.groupBy({
      by: ['searchType'],
      _count: true,
      _avg: { responseTime: true },
      where: { createdAt: { gte: since } },
    });
  }

  async getLatencyHeatmap(role: string) {
    this.assertAdmin(role);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const logs = await this.prisma.usageLog.findMany({
      where: { createdAt: { gte: since } },
      select: { responseTime: true, createdAt: true, searchType: true },
      take: 1000,
    });

    const heatmap: Record<string, Record<number, number>> = {};
    for (const log of logs) {
      const hour = log.createdAt.getHours();
      const type = log.searchType;
      if (!heatmap[type]) heatmap[type] = {};
      heatmap[type][hour] = (heatmap[type][hour] || 0) + 1;
    }

    return heatmap;
  }

  async getAuditLogs(role: string, page = 1, limit = 50) {
    this.assertAdmin(role);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return { logs, total, page, limit };
  }
}
