import { BackendEntitiesModule } from '@backend/database';
import { DicomInstance, ImageAnnotation } from '@backend/shared-domain';
import { Module } from '@nestjs/common';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';
import { ImageAnnotationsController } from './image-annotations.controller';
import { ImageAnnotationsRepository } from './image-annotations.repository';
import { ImageAnnotationsService } from './image-annotations.service';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([ImageAnnotation, DicomInstance])  ],
  controllers: [ImageAnnotationsController],
  providers: [
    ImageAnnotationsService,
    ImageAnnotationsRepository,
    DicomInstancesRepository,
    DicomStudiesRepository
   
  ],
  exports: [ImageAnnotationsService, BackendEntitiesModule],
})
export class ImageAnnotationsModule {}
