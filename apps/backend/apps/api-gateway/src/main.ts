// External packages
import cors from 'cors';
import * as express from 'express';
import * as qs from 'qs';
import cookieParser from 'cookie-parser';

// @nestjs packages
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

// Internal imports
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './utils/exception-filter.utils';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const startTime = Date.now();
  const logger = new Logger('ApiGateway');
  logger.log('🚀 Starting API Gateway...');

  // Tạo Nest App
  const nestStart = Date.now();
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    bufferLogs: true,
  });
  logger.log(`⏱️  NestJS Create: ${Date.now() - nestStart}ms`);

  const expressApp = app.getHttpAdapter().getInstance();
  const configService = app.get(ConfigService);

  // ✅ CORS
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://fedicom.vercel.app/login',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(cookieParser());
  // ✅ Express setup
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
  expressApp.set('query parser', (str: any) => qs.parse(str, { depth: 10 }));

  // ✅ Validation & Exception Filter
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // ✅ Prefix cho toàn bộ route
  app.setGlobalPrefix('api');

  // ✅ Register RoleGuard TRƯỚC khi init

  // ✅ Khởi tạo app
  const initStart = Date.now();
  await app.init();
  logger.log(`⏱️  App Init (Bootstrap): ${Date.now() - initStart}ms`);

  // ✅ Start server
  const listenStart = Date.now();
  const port = configService.get('PORT') || 5000;
  await app.listen(port);
  logger.log(`⏱️  HTTP Listen: ${Date.now() - listenStart}ms`);
  logger.log(`🎯 API Gateway is running at: http://localhost:${port}/api`);

  // ✅ Tổng thời gian
  const totalTime = Date.now() - startTime;
  logger.log(`🎉 Cold Start completed! Total time: ${totalTime}ms`);
}

bootstrap();
