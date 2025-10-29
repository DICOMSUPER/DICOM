import { Module } from '@nestjs/common';
import { ImagingModalitiesModule } from './imaging-modalities/imaging-modalities.module';

import {
  ImagingServiceClientModule,
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BodyPartModule } from './body-part/body-part.module';
import { BodyPartsModule } from './body-parts/body-parts.module';
import { DicomInstancesModule } from './dicom-instances/dicom-instances.module';
import { DicomSeriesModule } from './dicom-series/dicom-series.module';
import { DicomStudiesModule } from './dicom-studies/dicom-studies.module';
import { ImageAnnotationsModule } from './image-annotations/image-annotations.module';
import { ImagingOrdersModule } from './imaging-orders/imaging-orders.module';
import { ImagingServiceController } from './imaging-service.controller';
import { ModalityMachinesModule } from './modality-machines/modality-machines.module';
import { RequestProcedureModule } from './request-procedure/request-procedure.module';
import { ImagingOrderFormModule } from './imaging-order-form/imaging-order-form.module';



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
    ImagingOrderFormModule,
  ],
  exports: [
    ImagingModalitiesModule,
    ImagingOrdersModule,
    ModalityMachinesModule,
    BodyPartModule,
    RequestProcedureModule,
    ImagingOrderFormModule,
  ],
  controllers: [ImagingServiceController],
})
export class ImagingServiceModule {}
