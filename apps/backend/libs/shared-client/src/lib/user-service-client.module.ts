import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.USER_SERVICE_NAME || 'USER_SERVICE',
        Number(process.env.USER_SERVICE_TRANSPORT) || Transport.TCP,
        process.env.USER_SERVICE_HOST || 'localhost',
        Number(process.env.USER_SERVICE_PORT) || 5002
      ),
    ]),
  ],
  exports: [ClientsModule],
})
export class UserServiceClientModule {}
