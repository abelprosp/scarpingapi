import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  readonly httpRequestsTotal: Counter<string>;
  readonly httpRequestDuration: Histogram<string>;
  readonly searchRequestsTotal: Counter<string>;
  readonly searchDuration: Histogram<string>;
  readonly cacheHits: Counter<string>;
  readonly cacheMisses: Counter<string>;
  readonly proxyFailures: Counter<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration',
      labelNames: ['method', 'route'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.searchRequestsTotal = new Counter({
      name: 'search_requests_total',
      help: 'Total search requests',
      labelNames: ['type', 'cached', 'success'],
      registers: [this.registry],
    });

    this.searchDuration = new Histogram({
      name: 'search_duration_seconds',
      help: 'Search request duration',
      labelNames: ['type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [this.registry],
    });

    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Cache hits',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Cache misses',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.proxyFailures = new Counter({
      name: 'proxy_failures_total',
      help: 'Proxy failures',
      labelNames: ['type'],
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
