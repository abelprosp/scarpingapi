import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

export function initSentry(configService: ConfigService): void {
  const dsn = configService.get<string>('SENTRY_DSN');
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: configService.get<string>('app.nodeEnv'),
    tracesSampleRate: configService.get<string>('app.nodeEnv') === 'production' ? 0.1 : 1.0,
  });
}
