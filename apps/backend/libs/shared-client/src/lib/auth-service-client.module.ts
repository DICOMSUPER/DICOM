import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.AUTH_SERVICE_NAME || 'AUTH_SERVICE',
        Number(process.env.AUTH_SERVICE_TRANSPORT) || Transport.TCP,
        process.env.AUTH_SERVICE_HOST || 'localhost',
        Number(process.env.AUTH_SERVICE_HOST) || 5001
      ),
    ]),
  ],
  exports: [ClientsModule],
})
export class AuthServiceClientModule {}
