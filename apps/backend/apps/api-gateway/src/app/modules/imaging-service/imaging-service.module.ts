import { Module } from '@nestjs/common';
import { ImagingModalitiesModule } from './imaging-modalities/imaging-modalities.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { ImagingOrdersModule } from './imaging-orders/imaging-orders.module';
import { DicomStudiesModule } from './dicom-studies/dicom-studies.module';
import { DicomSeriesModule } from './dicom-series/dicom-series.module';
import { DicomInstancesModule } from './dicom-instances/dicom-instances.module';
import { ImageAnnotationsModule } from './image-annotations/image-annotations.module';

@Module({
  imports: [
    ImagingModalitiesModule,
    ClientsModule.register([
      getClient(
        process.env.IMAGE_SERVICE_NAME || 'ImagingService',
        Number(process.env.IMAGE_SERVICE_TRANSPORT || Transport.TCP),
        process.env.IMAGE_SERVICE_HOST || 'localhost',
        Number(process.env.IMAGE_SERVICE_PORT || 5003)
      ),
    ]),
    ImagingOrdersModule,
    DicomStudiesModule,
    DicomSeriesModule,
    DicomInstancesModule,

    ImageAnnotationsModule,
  ],
  exports: [ImagingModalitiesModule, ImagingOrdersModule],
})
export class ImagingServiceModule {}
