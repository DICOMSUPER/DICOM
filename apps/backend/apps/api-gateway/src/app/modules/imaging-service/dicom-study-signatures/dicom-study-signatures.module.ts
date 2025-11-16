import {
    ImagingServiceClientModule
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { Module } from '@nestjs/common';
import { DicomStudySignaturesController } from './dicom-study-signatures.controller';


@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
  ],
  controllers: [DicomStudySignaturesController],
    
})
export class DigitalSignatureModule {}
