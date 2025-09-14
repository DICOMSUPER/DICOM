import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { AuthModule } from './modules/auth/auth.module'; 
import dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.AUTH_SERVICE_NAME || 'AuthService',
        Number(process.env.AUTH_SERVICE_TRANSPORT || Transport.TCP),
        process.env.AUTH_SERVICE_HOST || 'localhost',
        Number(process.env.AUTH_SERVICE_PORT || 5001)
      ),
      getClient(
        process.env.USER_SERVICE_NAME || 'UserService',
        Number(process.env.USER_SERVICE_TRANSPORT || Transport.TCP),
        process.env.USER_SERVICE_HOST || 'localhost',
        Number(process.env.USER_SERVICE_PORT || 5002)
      ),
    ]),
    AuthModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}