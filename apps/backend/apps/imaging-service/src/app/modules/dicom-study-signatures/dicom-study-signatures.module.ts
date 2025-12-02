import { Module } from '@nestjs/common';

import { BackendEntitiesModule } from '@backend/database';
import { UserServiceClientModule } from '@backend/shared-client';
import { DicomStudy, DicomStudySignature } from '@backend/shared-domain';
import { DicomStudySignaturesController } from './dicom-study-signatures.controller';
import { DicomStudySignaturesService } from './dicom-study-signatures.service';
import { ImageAnnotationsModule } from '../image-annotations/image-annotations.module';
import { ImagingOrdersModule } from '../imaging-orders/imaging-orders.module';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([DicomStudySignature, DicomStudy]),
    UserServiceClientModule,
    ImageAnnotationsModule,
    ImagingOrdersModule
  ],
  controllers: [DicomStudySignaturesController],
  providers: [DicomStudySignaturesService],
  exports: [BackendEntitiesModule, UserServiceClientModule],
})
export class DicomStudySignaturesModule {}
