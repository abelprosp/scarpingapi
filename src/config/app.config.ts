import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  appName: process.env.APP_NAME || 'Serper Platform',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultFreeCredits: parseInt(process.env.DEFAULT_FREE_CREDITS || '2500', 10),
  creditsPerSearch: parseInt(process.env.CREDITS_PER_SEARCH || '1', 10),
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  cacheTtl: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'change-me',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}));

export const searchConfig = registerAs('search', () => ({
  defaultEngine: process.env.DEFAULT_SEARCH_ENGINE || 'google',
  defaultCountry: process.env.DEFAULT_COUNTRY || 'br',
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'pt',
  defaultDevice: process.env.DEFAULT_DEVICE || 'desktop',
  proxyEnabled: process.env.PROXY_ENABLED === 'true',
  browserEngine: process.env.BROWSER_ENGINE || 'playwright',
  browserHeadless: process.env.BROWSER_HEADLESS !== 'false',
  browserPoolSize: parseInt(process.env.BROWSER_POOL_SIZE || '5', 10),
  browserExecutablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    undefined,
  aiEnabled: process.env.AI_ENABLED === 'true',
}));
