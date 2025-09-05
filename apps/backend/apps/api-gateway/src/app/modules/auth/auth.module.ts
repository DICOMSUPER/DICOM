import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.AUTH_SERVICE_NAME || 'AuthService',
        Number(process.env.AUTH_SERVICE_TRANSPORT || Transport.TCP),
        process.env.AUTH_SERVICE_HOST || 'localhost',
        Number(process.env.AUTH_SERVICE_PORT || 5001)
      ),
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
