import { Module } from '@nestjs/common';
import { DicomInstancesController } from './dicom-instances.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [DicomInstancesController],
})
export class DicomInstancesModule {}
