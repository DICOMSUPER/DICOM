import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient('AUTH_SERVICE', Transport.TCP, 'localhost', 5001),
    ]),
  ],
  exports: [ClientsModule],
})
export class AuthServiceClientModule {}
