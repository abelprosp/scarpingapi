import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { jwtConfig } from './config/jwt.config';
import { searchConfig } from './config/search.config';
import { efiConfig, billingConfig } from './config/efi.config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { MetricsModule } from './infrastructure/monitoring/metrics.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { SearchModule } from './modules/search/search.module';
import { CacheModule } from './modules/cache/cache.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { BrowserModule } from './modules/browser/browser.module';
import { ParserModule } from './modules/parser/parser.module';
import { AiModule } from './modules/ai/ai.module';
import { BillingModule } from './modules/billing/billing.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { QueueModule } from './modules/queue/queue.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdvancedModule } from './modules/advanced/advanced.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, searchConfig, efiConfig, billingConfig],
      envFilePath: ['.env', '.env.local'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
        },
      }),
    }),
    PrismaModule,
    RedisModule,
    MetricsModule,
    AuthModule,
    UsersModule,
    ApiKeysModule,
    CacheModule,
    ProxyModule,
    BrowserModule,
    ParserModule,
    AiModule,
    SearchModule,
    QueueModule,
    BillingModule,
    DashboardModule,
    HealthModule,
    AuditModule,
    AdvancedModule,
  ],
})
export class AppModule {}
