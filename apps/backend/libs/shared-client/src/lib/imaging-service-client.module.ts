import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient('IMAGING_SERVICE', Transport.TCP, 'localhost', 5003),
    ]),
  ],
  exports: [ClientsModule],
})
export class ImagingServiceClientModule {}
