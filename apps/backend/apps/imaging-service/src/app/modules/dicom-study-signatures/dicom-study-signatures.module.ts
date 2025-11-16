import { Module } from '@nestjs/common';

import { BackendEntitiesModule } from '@backend/entities';
import { DicomStudy, DicomStudySignature } from '@backend/shared-domain';
import { DicomStudySignaturesController } from './dicom-study-signatures.controller';
import { DicomStudySignaturesService } from './dicom-study-signatures.service';
import { UserServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([DicomStudySignature, DicomStudy]),
    UserServiceClientModule,
  ],
  controllers: [DicomStudySignaturesController],
  providers: [DicomStudySignaturesService],
  exports: [BackendEntitiesModule,UserServiceClientModule],
})
export class DicomStudySignaturesModule {}
