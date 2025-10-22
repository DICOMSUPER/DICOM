import { Module } from '@nestjs/common';
import { DicomSeriesController } from './dicom-series.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [DicomSeriesController],
})
export class DicomSeriesModule {}
