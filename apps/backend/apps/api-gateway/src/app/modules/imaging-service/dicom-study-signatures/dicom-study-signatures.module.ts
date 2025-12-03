import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { Module } from '@nestjs/common';
import { DicomStudySignaturesController } from './dicom-study-signatures.controller';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [DicomStudySignaturesController],
})
export class DicomStudySignaturesModule {}
