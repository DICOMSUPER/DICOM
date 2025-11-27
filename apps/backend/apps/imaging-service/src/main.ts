/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
import { IMAGING_SERVICE } from './constant/microservice.constant';

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
  const transport = Number(process.env.TRANSPORT) || Transport.TCP;
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 5003;
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: transport,
    options: {
      host: host,
      port: port,
    },
  });

  await app.listen();
  const logger = new Logger(IMAGING_SERVICE);
  logger.log(`HTTP Imaging Service running on: http://localhost:${port}`);
}

bootstrap();
