import { Module } from '@nestjs/common';

import { BackendEntitiesModule } from '@backend/database';
import {
  UserServiceClientModule
} from '@backend/shared-client';
import { DicomStudy, DicomStudySignature } from '@backend/shared-domain';
import { ImageAnnotationsModule } from '../image-annotations/image-annotations.module';
import { ImagingOrdersModule } from '../imaging-orders/imaging-orders.module';
import { DicomStudySignaturesController } from './dicom-study-signatures.controller';
import { DicomStudySignaturesService } from './dicom-study-signatures.service';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([DicomStudySignature, DicomStudy]),
    UserServiceClientModule,
    // PatientServiceClientModule,
    ImageAnnotationsModule,
    ImagingOrdersModule,
  ],
  controllers: [DicomStudySignaturesController],
  providers: [DicomStudySignaturesService],
  exports: [
    BackendEntitiesModule,
    UserServiceClientModule,
    // PatientServiceClientModule,
  ],
})
export class DicomStudySignaturesModule {}
