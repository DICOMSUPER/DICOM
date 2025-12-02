/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */ 
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { RedisIoAdapter } from './app/adapters/redis.adapter';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const transport = Number(process.env.TRANSPORT) || Transport.TCP;
  const host = process.env.HOST || 'localhost';
  const port = Number(process.env.PORT) || 5006;
  const socketPort = Number(process.env.HTTP_SOCKET_PORT) || 3006;
  app.use(
    cors({
      origin: ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(cookieParser());

  // const connectionKeeper = app.get('RedisConnectionsKeeper');
  // app.useWebSocketAdapter(new RedisIoAdapter(app, connectionKeeper));
  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);
  app.connectMicroservice<MicroserviceOptions>({
    transport,
    options: {
      host: host,
      port: port,
    },
  });

  await app.startAllMicroservices();
  await app.listen(socketPort);
  Logger.log(`🚀 Application is running on: http://localhost:${socketPort}`);
}

bootstrap();
