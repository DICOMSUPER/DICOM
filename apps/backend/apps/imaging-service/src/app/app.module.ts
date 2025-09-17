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
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DicomInstancesModule,
    DicomSeriesModule,
    DatabaseModule.forService({
      prefix: 'IMAGING',
      defaultDbName: 'dicom_imaging_service',
    }),
    DicomStudiesModule,
    ImageAnnotationsModule,
    ImagingModalitiesModule,
    ImagingOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
