import { DatabaseModule } from '@backend/database';
import { BackendEntitiesModule } from '@backend/entities';
import {
  BodyPart,
  DicomInstance,
  DicomSeries,
  DicomStudy,
  ImagingModality,
  ImagingOrder,
  ImagingOrderForm,
  ModalityMachine,
  RequestProcedure,
} from '@backend/shared-domain';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BodyPartModule } from './modules/body-part/body-part.module';
import { BodyPartRepository } from './modules/body-part/body-part.repository';
import { BodyPartService } from './modules/body-part/body-part.service';
import { DicomInstancesModule } from './modules/dicom-instances/dicom-instances.module';
import { DicomInstancesRepository } from './modules/dicom-instances/dicom-instances.repository';
import { DicomInstancesService } from './modules/dicom-instances/dicom-instances.service';
import { DicomSeriesModule } from './modules/dicom-series/dicom-series.module';
import { DicomSeriesRepository } from './modules/dicom-series/dicom-series.repository';
import { DicomSeriesService } from './modules/dicom-series/dicom-series.service';
import { DicomStudiesModule } from './modules/dicom-studies/dicom-studies.module';
import { DicomStudiesRepository } from './modules/dicom-studies/dicom-studies.repository';
import { DicomStudiesService } from './modules/dicom-studies/dicom-studies.service';
import { ImageAnnotationsModule } from './modules/image-annotations/image-annotations.module';
import { ImagingModalitiesModule } from './modules/imaging-modalities/imaging-modalities.module';
import { ImagingModalityRepository } from './modules/imaging-modalities/imaging-modalities.repository';
import { ImagingModalitiesService } from './modules/imaging-modalities/imaging-modalities.service';
import { ImagingOrdersModule } from './modules/imaging-orders/imaging-orders.module';
import { ImagingOrderRepository } from './modules/imaging-orders/imaging-orders.repository';
import { ImagingOrdersService } from './modules/imaging-orders/imaging-orders.service';
import { ModalityMachinesModule } from './modules/modality-machines/modality-machines.module';
import { ModalityMachinesRepository } from './modules/modality-machines/modality-machines.repository';
import { ModalityMachinesService } from './modules/modality-machines/modality-machines.service';
import { RequestProcedureModule } from './modules/request-procedure/request-procedure.module';
import { SeedingModule } from './modules/seeding/seeding.module';
import { ImagingOrderFormModule } from './modules/imaging-order-form/imaging-order-form.module';
import { ImagingOrderFormService } from './modules/imaging-order-form/imaging-order-form.service';
import { ImagingOrderFormRepository } from './modules/imaging-order-form/imaging-order-form.repository';
import { BackendRedisModule } from '@backend/redis';
import { PatientServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    BackendEntitiesModule.forFeature([
      DicomInstance,
      DicomSeries,
      DicomStudy,
      ImagingModality,
      ImagingOrder,
      RequestProcedure,
      ModalityMachine,
      BodyPart,
      ImagingOrderForm,
    ]),
    DicomInstancesModule,
    DicomSeriesModule,
    DatabaseModule.forService({
      prefix: 'IMAGING',
      defaultDbName: 'dicom_imaging_service',
    }),
    TypeOrmModule,
    DicomStudiesModule,
    ImageAnnotationsModule,
    ImagingModalitiesModule,
    ImagingOrdersModule,
    ModalityMachinesModule,
    SeedingModule,
    BodyPartModule,
    RequestProcedureModule,
    ImagingOrderFormModule,
    // BackendRedisModule,
    PatientServiceClientModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DicomInstancesService,
    DicomInstancesRepository,
    DicomSeriesService,
    DicomSeriesRepository,
    DicomStudiesRepository,
    DicomStudiesService,
    ImagingModalitiesService,
    ImagingModalityRepository,
    ImagingOrderRepository,
    ImagingOrdersService,
    ModalityMachinesService,
    ModalityMachinesRepository,
    BodyPartService,
    BodyPartRepository,
    ImagingOrderFormService,
    ImagingOrderFormRepository,
  ],
})
export class AppModule {}
