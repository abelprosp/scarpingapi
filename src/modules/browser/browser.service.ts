import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { chromium, Browser, BrowserContext, Page } from 'playwright';

export type BrowserEngine = 'playwright' | 'puppeteer';

export interface FetchOptions {
  url: string;
  proxy?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };
  cookies?: Array<{ name: string; value: string; domain: string }>;
  waitForSelector?: string;
  timeout?: number;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 390, height: 844 },
];

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Browser | null = null;
  private readonly engine: BrowserEngine;
  private readonly headless: boolean;
  private readonly poolSize: number;
  private contextPool: BrowserContext[] = [];
  private poolIndex = 0;

  constructor(private readonly configService: ConfigService) {
    this.engine = this.configService.get<BrowserEngine>('search.browserEngine', 'playwright');
    this.headless = this.configService.get<boolean>('search.browserHeadless', true);
    this.poolSize = this.configService.get<number>('search.browserPoolSize', 5);
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
        ],
      });

      for (let i = 0; i < this.poolSize; i++) {
        const context = await this.createContext();
        this.contextPool.push(context);
      }
    }
    return this.browser;
  }

  private async createContext(proxy?: string): Promise<BrowserContext> {
    const browser = this.browser ?? (await chromium.launch({ headless: this.headless }));
    const viewport = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];

    return browser.newContext({
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      viewport,
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
      ...(proxy ? { proxy: { server: proxy } } : {}),
      extraHTTPHeaders: {
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });
  }

  private getContextFromPool(): BrowserContext {
    const context = this.contextPool[this.poolIndex % this.contextPool.length];
    this.poolIndex++;
    return context;
  }

  randomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  randomViewport(): { width: number; height: number } {
    return VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
  }

  async fetchPage(options: FetchOptions): Promise<string> {
    await this.getBrowser();
    const context = this.getContextFromPool();
    const page = await context.newPage();

    try {
      if (options.cookies?.length) {
        await context.addCookies(options.cookies);
      }

      const delay = 500 + Math.random() * 1500;
      await new Promise((r) => setTimeout(r, delay));

      await page.goto(options.url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout ?? 30000,
      });

      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 }).catch(() => {});
      }

      const content = await page.content();

      const isCaptcha = await this.detectCaptcha(page);
      if (isCaptcha) {
        throw new Error('CAPTCHA_DETECTED');
      }

      return content;
    } finally {
      await page.close();
    }
  }

  private async detectCaptcha(page: Page): Promise<boolean> {
    const captchaSelectors = [
      '#captcha',
      '.g-recaptcha',
      '#recaptcha',
      'iframe[src*="recaptcha"]',
      '[data-captcha]',
    ];

    for (const selector of captchaSelectors) {
      const element = await page.$(selector);
      if (element) return true;
    }
    return false;
  }

  async onModuleDestroy() {
    for (const context of this.contextPool) {
      await context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}
