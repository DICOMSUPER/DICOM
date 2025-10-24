import { Module } from '@nestjs/common';
import { ImagingModalitiesModule } from './imaging-modalities/imaging-modalities.module';

import { ImagingOrdersModule } from './imaging-orders/imaging-orders.module';
import { DicomStudiesModule } from './dicom-studies/dicom-studies.module';
import { DicomSeriesModule } from './dicom-series/dicom-series.module';
import { DicomInstancesModule } from './dicom-instances/dicom-instances.module';
import { ImageAnnotationsModule } from './image-annotations/image-annotations.module';
import { ImagingServiceController } from './imaging-service.controller';
import { BodyPartModule } from './body-part/body-part.module';
import { RequestProcedureModule } from './request-procedure/request-procedure.module';
import {
  ImagingServiceClientModule,
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { ModalityMachinesModule } from './modality-machines/modality-machines.module';
import { BodyPartsModule } from './body-parts/body-parts.module';

@Module({
  imports: [
    ImagingModalitiesModule,
    ImagingServiceClientModule,
    UserServiceClientModule,
    PatientServiceClientModule,
    ImagingOrdersModule,
    DicomStudiesModule,
    DicomSeriesModule,
    DicomInstancesModule,
    SharedInterceptorModule,
    ImageAnnotationsModule,
    ModalityMachinesModule,
    BodyPartModule,
    RequestProcedureModule,
    BodyPartsModule,
  ],
  exports: [
    ImagingModalitiesModule,
    ImagingOrdersModule,
    ModalityMachinesModule,
    BodyPartModule,
    RequestProcedureModule,
  ],
  controllers: [ImagingServiceController],
})
export class ImagingServiceModule {}
