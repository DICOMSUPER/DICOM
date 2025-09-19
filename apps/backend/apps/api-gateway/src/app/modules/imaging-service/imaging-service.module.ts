import { Module } from '@nestjs/common';
import { ImagingModalitiesModule } from './imaging-modalities/imaging-modalities.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';

@Module({
  imports: [
    ImagingModalitiesModule,
    ClientsModule.register([
      getClient(
        process.env.IMAGE_SERVICE_NAME || 'ImageService',
        Number(process.env.IMAGE_SERVICE_TRANSPORT || Transport.TCP),
        process.env.IMAGE_SERVICE_HOST || 'localhost',
        Number(process.env.IMAGE_SERVICE_PORT || 5003)
      ),
    ]),
  ],
  exports: [ImagingModalitiesModule],
})
export class ImagingServiceModule {}
