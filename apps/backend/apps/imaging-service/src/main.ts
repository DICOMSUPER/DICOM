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

process.setMaxListeners(20);

process.on('unhandledRejection', (reason: any, promise) => {
  const logger = new Logger('UnhandledRejection');
  
  // Enhance database connection errors with connection details
  if (reason?.message?.includes('connection') || 
      reason?.message?.includes('database') ||
      reason?.code === 'ETIMEDOUT' || 
      reason?.code === 'ECONNREFUSED' ||
      reason?.message?.includes('Connection terminated')) {
    const errorMessage = reason?.message || String(reason);
    logger.error(
      `Database connection error detected. Check your database configuration and ensure the database server is running.`,
      errorMessage
    );
    if (reason?.stack) {
      logger.error('Stack trace:', reason.stack);
    }
  } else {
    logger.error('Unhandled Promise Rejection:', reason);
    logger.error('Promise:', promise);
  }
});

process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  logger.error('Stack:', error.stack);
  process.exit(1);
});

async function bootstrap() {
  const startTime = Date.now();
  const logger = new Logger(IMAGING_SERVICE);
  const transport = Number(process.env.TRANSPORT) || Transport.TCP;
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 5003;

  try {
    logger.log('🚀 Starting Imaging Service...');

    const createStart = Date.now();
    const app = await NestFactory.createMicroservice(AppModule, {
      transport: transport,
      options: {
        host: host,
        port: port,
      },
    });
    logger.log(`⏱️  Microservice Create: ${Date.now() - createStart}ms`);

    const listenStart = Date.now();
    await app.listen();
    logger.log(`⏱️  Microservice Listen: ${Date.now() - listenStart}ms`);
    logger.log(`🎯 Imaging Service is running on: ${host}:${port}`);

    const totalTime = Date.now() - startTime;
    logger.log(`🎉 Cold Start completed! Total time: ${totalTime}ms`);
  } catch (error: any) {
    logger.error('❌ Failed to start Imaging Service:', error);
    
    // Check if it's a database connection error
    if (error?.message?.includes('database') || 
        error?.message?.includes('connection') ||
        error?.message?.includes('Unable to connect')) {
      const dbHost = process.env.IMAGING_DB_HOST || 'localhost';
      const dbPort = process.env.IMAGING_DB_PORT || 5432;
      const dbName = process.env.IMAGING_DB_NAME || 'dicom_imaging_service';
      const dbUser = process.env.IMAGING_DB_USERNAME || 'postgres';
      
      logger.error(
        `Database connection error. Attempted connection: host=${dbHost} port=${dbPort} database=${dbName} username=${dbUser}`
      );
    }
    
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
