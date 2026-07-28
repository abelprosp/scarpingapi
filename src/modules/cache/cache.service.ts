import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { MetricsService } from '../../infrastructure/monitoring/metrics.service';

export interface CacheKeyParams {
  type: string;
  query: string;
  country: string;
  language: string;
  device: string;
  page?: number;
  num?: number;
  extra?: Record<string, string | number>;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly enabled: boolean;
  private readonly defaultTtl: number;

  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
    private readonly metrics: MetricsService,
  ) {
    this.enabled = this.configService.get<boolean>('redis.cacheEnabled', true);
    this.defaultTtl = this.configService.get<number>('redis.cacheTtl', 3600);
  }

  buildKey(params: CacheKeyParams): string {
    const payload = JSON.stringify({
      type: params.type,
      q: params.query.toLowerCase().trim(),
      gl: params.country,
      hl: params.language,
      device: params.device,
      page: params.page ?? 1,
      num: params.num ?? 10,
      ...params.extra,
    });
    const hash = createHash('sha256').update(payload).digest('hex').slice(0, 32);
    return `serper:cache:${params.type}:${hash}`;
  }

  async get<T>(key: string, type: string): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      const data = await this.redis.get(key);
      if (data) {
        this.metrics.cacheHits.inc({ type });
        return JSON.parse(data) as T;
      }
      this.metrics.cacheMisses.inc({ type });
      return null;
    } catch (error) {
      this.logger.warn(`Cache get error: ${error}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.redis.set(key, JSON.stringify(value), ttlSeconds ?? this.defaultTtl);
    } catch (error) {
      this.logger.warn(`Cache set error: ${error}`);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const client = this.redis.getClient();
    const keys = await client.keys(`serper:cache:${pattern}*`);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}
