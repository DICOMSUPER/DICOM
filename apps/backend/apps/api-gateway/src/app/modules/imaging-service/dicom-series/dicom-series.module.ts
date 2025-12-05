import { Module } from '@nestjs/common';
import { DicomSeriesController } from './dicom-series.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [DicomSeriesController],
})
export class DicomSeriesModule {}
