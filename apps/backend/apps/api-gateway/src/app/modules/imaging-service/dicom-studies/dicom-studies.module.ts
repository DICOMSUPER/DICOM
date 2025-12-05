import { Module } from '@nestjs/common';
import { DicomStudiesController } from './dicom-studies.controller';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import {
  UserServiceClientModule,
  PatientServiceClientModule,
  ImagingServiceClientModule,
} from '@backend/shared-client';
import { BackendRedisModule } from '@backend/redis';
@Module({
  imports: [
    ImagingServiceClientModule,
    UserServiceClientModule,
    PatientServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [DicomStudiesController],
})
export class DicomStudiesModule {}
