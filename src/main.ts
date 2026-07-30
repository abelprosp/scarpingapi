import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { initSentry } from './infrastructure/monitoring/sentry';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false, trustProxy: true }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const appName = configService.get<string>('app.appName', 'Serper Platform');
  const publicUrl = configService.get<string>('app.publicUrl', 'http://localhost:3000');
  const corsOriginRaw = configService.get<string>('CORS_ORIGIN', '*');
  const corsOrigin = corsOriginRaw.includes(',')
    ? corsOriginRaw.split(',').map((value) => value.trim())
    : corsOriginRaw;

  initSentry(configService);

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });
  await app.register(compress);

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${appName} API`)
    .setDescription(
      'API REST de busca em motores de pesquisa com resultados estruturados para IA, automações e inteligência de mercado.',
    )
    .setVersion('1.0')
    .addServer(`${publicUrl}/${apiPrefix}`, 'Production')
    .addServer(`http://localhost:${port}/${apiPrefix}`, 'Local')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .addTag('Search', 'Endpoints de busca')
    .addTag('Account', 'Créditos e uso')
    .addTag('Auth', 'Autenticação')
    .addTag('Dashboard', 'Painel administrativo')
    .addTag('Billing', 'Faturamento e assinaturas')
    .addTag('Advanced APIs', 'APIs avançadas: Crawl, Extract, RAG, Deep Research, etc.')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on ${publicUrl}/${apiPrefix}`);
  logger.log(`Swagger docs: ${publicUrl}/docs`);
}

bootstrap();
