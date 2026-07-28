import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../../infrastructure/monitoring/metrics.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            getClient: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              const config: Record<string, unknown> = {
                'redis.cacheEnabled': true,
                'redis.cacheTtl': 3600,
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: MetricsService,
          useValue: {
            cacheHits: { inc: jest.fn() },
            cacheMisses: { inc: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should build consistent cache keys', () => {
    const key1 = service.buildKey({
      type: 'web',
      query: 'test query',
      country: 'br',
      language: 'pt',
      device: 'desktop',
    });
    const key2 = service.buildKey({
      type: 'web',
      query: 'test query',
      country: 'br',
      language: 'pt',
      device: 'desktop',
    });
    expect(key1).toBe(key2);
    expect(key1).toMatch(/^serper:cache:/);
  });
});
