import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.USER_SERVICE_NAME || 'UserService',
        Number(process.env.USER_SERVICE_TRANSPORT || Transport.TCP),
        process.env.USER_SERVICE_HOST || 'localhost',
        Number(process.env.USER_SERVICE_PORT || 5002)
      ),
      getClient(
        process.env.AUTH_SERVICE_NAME || 'AuthService',
        Number(process.env.AUTH_SERVICE_TRANSPORT || Transport.TCP),
        process.env.AUTH_SERVICE_HOST || 'localhost',
        Number(process.env.AUTH_SERVICE_PORT || 5001)
      ), //if use guards need auth service
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
