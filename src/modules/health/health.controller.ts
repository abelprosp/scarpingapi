import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/auth.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check' })
  async health() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.services.database = 'healthy';
    } catch {
      checks.services.database = 'unhealthy';
      checks.status = 'degraded';
    }

    try {
      await this.redis.getClient().ping();
      checks.services.redis = 'healthy';
    } catch {
      checks.services.redis = 'unhealthy';
      checks.status = 'degraded';
    }

    return checks;
  }

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Status da plataforma' })
  status() {
    const appName = this.configService.get<string>('app.appName', 'Serper Platform');
    const publicUrl = this.configService.get<string>('app.publicUrl', 'http://localhost:3000');
    const apiPrefix = this.configService.get<string>('app.apiPrefix', 'api/v1');

    return {
      platform: appName,
      version: '1.0.0',
      status: 'operational',
      baseUrl: `${publicUrl}/${apiPrefix}`,
      docs: `${publicUrl}/docs`,
      domain: this.configService.get<string>('app.domain', 'localhost'),
      endpoints: [
        'POST /search',
        'POST /images',
        'POST /news',
        'POST /shopping',
        'POST /videos',
        'POST /maps',
        'POST /places',
        'POST /crawl',
        'POST /extract',
        'POST /screenshot',
        'POST /pdf',
        'POST /research',
        'POST /ai-search',
        'POST /deep-research',
        'POST /dataset/*',
        'POST /rag/*',
        'POST /browser/navigate',
        'GET /capabilities',
      ],
    };
  }
}
