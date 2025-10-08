/**
 * Patient Service - Microservice for patient management
 */
import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
import { ResponseInterceptor } from './app/interceptors/response.interceptor';
import { PatientServiceExceptionFilter } from './app/filters/exception.filter';

async function bootstrap() {
  const transport = Number(process.env.TRANSPORT) || Transport.TCP;
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 5004;
  
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: transport,
    options: {
      host: host,
      port: port,
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global exception filter
  app.useGlobalFilters(new PatientServiceExceptionFilter());

  await app.listen();
  const logger = new Logger('PatientService');
  logger.log(`🚀 Patient Service running on: ${host}:${port}`);
  logger.log(`📡 Transport: ${transport === Transport.TCP ? 'TCP' : 'Redis'}`);
}

bootstrap();
