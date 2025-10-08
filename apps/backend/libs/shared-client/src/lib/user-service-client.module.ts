import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient('USER_SERVICE', Transport.TCP, 'localhost', 5002),
    ]),
  ],
  exports: [ClientsModule],
})
export class UserServiceClientModule {}
