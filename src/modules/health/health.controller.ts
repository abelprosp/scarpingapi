import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/auth.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
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
    return {
      platform: 'Serper Platform',
      version: '1.0.0',
      status: 'operational',
      endpoints: [
        'POST /search',
        'POST /images',
        'POST /news',
        'POST /shopping',
        'POST /videos',
        'POST /maps',
        'POST /places',
        'POST /autocomplete',
        'POST /related-searches',
        'POST /knowledge-graph',
        'POST /reverse-image',
        'POST /batch',
      ],
    };
  }
}
