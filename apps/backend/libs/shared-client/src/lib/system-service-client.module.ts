import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
@Module({
  imports: [
    ClientsModule.register([
      getClient('SYSTEM_SERVICE', Transport.TCP, 'localhost', 3004),
    ]),
  ],
  exports: [ClientsModule],
})
export class SystemServiceClientModule {}
