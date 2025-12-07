import 'reflect-metadata';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

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
  const logger = new Logger('WebSocketGateway');
  const transport = Number(process.env.TRANSPORT) || Transport.TCP;
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 5006;
  const socketPort = Number(process.env.HTTP_SOCKET_PORT) || 3006;

  try {
    logger.log('🚀 Starting WebSocket Gateway...');

    const createStart = Date.now();
    const app = await NestFactory.create(AppModule);
    logger.log(`⏱️  NestJS Create: ${Date.now() - createStart}ms`);

    // CORS
    app.use(
      cors({
        origin: [
          'http://localhost:3000',
          'https://fedicom.vercel.app',

          'https://fedicom-mkip4rxmu-anhminhs-projects.vercel.app',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      })
    );

    app.use(cookieParser());

    // Connect microservice
    const microserviceStart = Date.now();
    app.connectMicroservice<MicroserviceOptions>({
      transport,
      options: {
        host: host,
        port: port,
      },
    });
    logger.log(`⏱️  Microservice Connect: ${Date.now() - microserviceStart}ms`);

    const startServicesStart = Date.now();
    await app.startAllMicroservices();
    logger.log(
      `⏱️  Start All Microservices: ${Date.now() - startServicesStart}ms`
    );

    const listenStart = Date.now();
    await app.listen(socketPort);
    logger.log(`⏱️  HTTP Listen: ${Date.now() - listenStart}ms`);
    logger.log(
      `🎯 WebSocket Gateway is running on: http://localhost:${socketPort}`
    );
    logger.log(`🎯 Microservice is running on: ${host}:${port}`);

    const totalTime = Date.now() - startTime;
    logger.log(`🎉 Cold Start completed! Total time: ${totalTime}ms`);
  } catch (error: any) {
    logger.error('❌ Failed to start WebSocket Gateway:', error);
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
