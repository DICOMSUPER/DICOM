import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DicomInstancesModule } from './modules/dicom-instances/dicom-instances.module';
import { DicomSeriesModule } from './modules/dicom-series/dicom-series.module';
import { DatabaseModule } from '@backend/database';
import { DicomStudiesModule } from './modules/dicom-studies/dicom-studies.module';
import { ImageAnnotationsModule } from './modules/image-annotations/image-annotations.module';
import { ImagingModalitiesModule } from './modules/imaging-modalities/imaging-modalities.module';
import { ImagingOrdersModule } from './modules/imaging-orders/imaging-orders.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { DicomInstancesService } from './modules/dicom-instances/dicom-instances.service';
import { DicomInstancesRepository } from './modules/dicom-instances/dicom-instances.repository';
import { DicomSeriesService } from './modules/dicom-series/dicom-series.service';
import { DicomSeriesRepository } from './modules/dicom-series/dicom-series.repository';
import { DicomStudiesRepository } from './modules/dicom-studies/dicom-studies.repository';
import { DicomStudiesService } from './modules/dicom-studies/dicom-studies.service';
import { ImagingModalitiesService } from './modules/imaging-modalities/imaging-modalities.service';
import { ImagingModalityRepository } from './modules/imaging-modalities/imaging-modalities.repository';
import { ImagingOrderRepository } from './modules/imaging-orders/imaging-orders.repository';
import { ImagingOrdersService } from './modules/imaging-orders/imaging-orders.service';
import { BackendEntitiesModule } from '@backend/entities';
import {
  BodyPart,
  DicomInstance,
  DicomSeries,
  DicomStudy,
  ImagingModality,
  ImagingOrder,
  ModalityMachine,
  RequestProcedure,
} from '@backend/shared-domain';
import { SeedingModule } from './modules/seeding/seeding.module';
import { BodyPartModule } from './modules/body-part/body-part.module';
import { BodyPartService } from './modules/body-part/body-part.service';
import { BodyPartRepository } from './modules/body-part/body-part.repository';
import { RequestProcedureModule } from './modules/request-procedure/request-procedure.module';

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
      BodyPart
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
    SeedingModule,
    BodyPartModule,
    RequestProcedureModule
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
    BodyPartService,
    BodyPartRepository
  ],
})
export class AppModule {}
