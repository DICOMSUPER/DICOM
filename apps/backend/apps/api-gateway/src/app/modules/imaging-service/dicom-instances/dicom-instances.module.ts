import { Module } from '@nestjs/common';
import { DicomInstancesController } from './dicom-instances.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [DicomInstancesController],
})
export class DicomInstancesModule {}
