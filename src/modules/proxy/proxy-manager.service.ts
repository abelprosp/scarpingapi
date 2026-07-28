import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { MetricsService } from '../../infrastructure/monitoring/metrics.service';
import { ProxyType, ProxyStatus } from '@prisma/client';

export interface ProxyConfig {
  id: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  type: ProxyType;
  country?: string;
}

export interface ProxySession {
  proxyId: string;
  url: string;
  stickyUntil?: Date;
}

@Injectable()
export class ProxyManagerService implements OnModuleInit {
  private readonly logger = new Logger(ProxyManagerService.name);
  private readonly enabled: boolean;
  private proxyPool: ProxyConfig[] = [];
  private currentIndex = 0;
  private stickySessions = new Map<string, ProxySession>();
  private blacklist = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly metrics: MetricsService,
  ) {
    this.enabled = this.configService.get<boolean>('search.proxyEnabled', false);
  }

  async onModuleInit() {
    if (this.enabled) {
      await this.loadProxies();
      setInterval(() => void this.healthCheck(), 60000);
    }
  }

  async loadProxies(): Promise<void> {
    const proxies = await this.prisma.proxy.findMany({
      where: { status: ProxyStatus.ACTIVE },
    });

    this.proxyPool = proxies.map((p) => ({
      id: p.id,
      host: p.host,
      port: p.port,
      username: p.username ?? undefined,
      password: p.password ?? undefined,
      type: p.type,
      country: p.country ?? undefined,
    }));

    this.logger.log(`Loaded ${this.proxyPool.length} proxies`);
  }

  getNextProxy(options?: { country?: string; stickyKey?: string; type?: ProxyType }): ProxyConfig | null {
    if (!this.enabled || this.proxyPool.length === 0) return null;

    if (options?.stickyKey) {
      const session = this.stickySessions.get(options.stickyKey);
      if (session && (!session.stickyUntil || session.stickyUntil > new Date())) {
        const proxy = this.proxyPool.find((p) => p.id === session.proxyId);
        if (proxy) return proxy;
      }
    }

    let candidates = this.proxyPool.filter((p) => !this.blacklist.has(p.id));

    if (options?.country) {
      const geoFiltered = candidates.filter((p) => p.country === options.country);
      if (geoFiltered.length > 0) candidates = geoFiltered;
    }

    if (options?.type) {
      const typeFiltered = candidates.filter((p) => p.type === options.type);
      if (typeFiltered.length > 0) candidates = typeFiltered;
    }

    if (candidates.length === 0) {
      this.logger.warn('No available proxies, attempting failover');
      this.blacklist.clear();
      candidates = this.proxyPool;
    }

    const proxy = candidates[this.currentIndex % candidates.length];
    this.currentIndex++;

    if (options?.stickyKey) {
      this.stickySessions.set(options.stickyKey, {
        proxyId: proxy.id,
        url: this.buildProxyUrl(proxy),
        stickyUntil: new Date(Date.now() + 30 * 60 * 1000),
      });
    }

    return proxy;
  }

  buildProxyUrl(proxy: ProxyConfig): string {
    if (proxy.username && proxy.password) {
      return `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    }
    return `http://${proxy.host}:${proxy.port}`;
  }

  async reportSuccess(proxyId: string, latencyMs: number): Promise<void> {
    await this.prisma.proxy.update({
      where: { id: proxyId },
      data: {
        successCount: { increment: 1 },
        lastUsedAt: new Date(),
        avgLatency: latencyMs,
        lastCheckAt: new Date(),
      },
    });
  }

  async reportFailure(proxyId: string): Promise<void> {
    this.blacklist.add(proxyId);
    this.metrics.proxyFailures.inc({ type: 'request' });

    const proxy = await this.prisma.proxy.update({
      where: { id: proxyId },
      data: { failureCount: { increment: 1 }, lastCheckAt: new Date() },
    });

    if (proxy.failureCount > 10) {
      await this.prisma.proxy.update({
        where: { id: proxyId },
        data: { status: ProxyStatus.FAILED },
      });
      this.proxyPool = this.proxyPool.filter((p) => p.id !== proxyId);
    }
  }

  async healthCheck(): Promise<void> {
    for (const proxy of this.proxyPool) {
      try {
        const start = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        await fetch('https://httpbin.org/ip', {
          signal: controller.signal,
          // @ts-expect-error - node fetch proxy support
          proxy: this.buildProxyUrl(proxy),
        });

        clearTimeout(timeout);
        await this.reportSuccess(proxy.id, Date.now() - start);
      } catch {
        await this.reportFailure(proxy.id);
      }
    }
  }
}
