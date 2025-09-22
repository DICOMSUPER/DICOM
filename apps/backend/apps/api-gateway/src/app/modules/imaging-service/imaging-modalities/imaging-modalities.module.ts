import { Module } from '@nestjs/common';
import { ImagingModalitiesController } from './imaging-modalities.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.IMAGE_SERVICE_NAME || 'ImagingService',
        Number(process.env.IMAGE_SERVICE_TRANSPORT || Transport.TCP),
        process.env.IMAGE_SERVICE_HOST || 'localhost',
        Number(process.env.IMAGE_SERVICE_PORT || 5003)
      ),
    ]),
  ],
  controllers: [ImagingModalitiesController],
})
export class ImagingModalitiesModule {}
