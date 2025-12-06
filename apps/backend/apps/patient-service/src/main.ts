/**
 * Patient Service - Microservice for patient management
 */
import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';

process.setMaxListeners(20);

process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Promise Rejection:', reason);
  logger.error('Promise:', promise);
});

process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  logger.error('Stack:', error.stack);
  process.exit(1);
});

async function bootstrap() {
  const startTime = Date.now();
  const logger = new Logger('PatientService');
  const transport = Number(process.env.TRANSPORT) || Transport.TCP;
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 5004;

  try {
    logger.log('🚀 Starting Patient Service...');

    const createStart = Date.now();
    const app = await NestFactory.createMicroservice(AppModule, {
      transport: transport,
      options: {
        host: host,
        port: port,
      },
    });
    logger.log(`⏱️  Microservice Create: ${Date.now() - createStart}ms`);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    const listenStart = Date.now();
    await app.listen();
    logger.log(`⏱️  Microservice Listen: ${Date.now() - listenStart}ms`);
    logger.log(`🎯 Patient Service is running on: ${host}:${port}`);

    const totalTime = Date.now() - startTime;
    logger.log(`🎉 Cold Start completed! Total time: ${totalTime}ms`);
  } catch (error: any) {
    logger.error('❌ Failed to start Patient Service:', error);
    if (error?.message) {
      logger.error('Error message:', error.message);
    }
    if (error?.stack) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

bootstrap();
