import { Module } from '@nestjs/common';
import { DicomSeriesController } from './dicom-series.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [DicomSeriesController],
})
export class DicomSeriesModule {}
