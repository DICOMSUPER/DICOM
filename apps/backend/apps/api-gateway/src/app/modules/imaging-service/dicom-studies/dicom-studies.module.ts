import { Module } from '@nestjs/common';
import { DicomStudiesController } from './dicom-studies.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

import {
  UserServiceClientModule,
  PatientServiceClientModule,
  ImagingServiceClientModule,
} from '@backend/shared-client';
@Module({
  imports: [
    ImagingServiceClientModule,
    UserServiceClientModule,
    PatientServiceClientModule,
    SharedInterceptorModule,
  ],
  controllers: [DicomStudiesController],
})
export class DicomStudiesModule {}
