import { Module } from '@nestjs/common';
import { DicomInstancesController } from './dicom-instances.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [DicomInstancesController],
})
export class DicomInstancesModule {}
