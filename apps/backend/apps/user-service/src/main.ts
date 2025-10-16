/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Transport } from '@nestjs/microservices';
async function bootstrap() {
  console.log('=== Environment Variables Debug ===');
  console.log('Current working directory:', process.cwd());
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);
  console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
  console.log('USER_DB_NAME:', process.env.USER_DB_NAME);
  console.log('===================================');
  const transport = Number(process.env.TRANSPORT) || Transport.TCP;
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 5002;
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: transport,
    options: {
      host: host,
      port: port,
    },
  });

  await app.listen();
  const logger = new Logger('UserService');
  logger.log(`User Service is running on port ${port}`);
}

bootstrap();
