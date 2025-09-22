import { Module } from '@nestjs/common';
import { ImageAnnotationsService } from './image-annotations.service';
import { ImageAnnotationsController } from './image-annotations.controller';
import { ImageAnnotation } from '@backend/shared-domain';
import { DicomInstance } from '@backend/shared-domain';
import { BackendEntitiesModule } from '@backend/entities';
import { ImageAnotationsRepository } from './image-anotations.repository';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';

@Module({
  imports: [BackendEntitiesModule.forFeature([ImageAnnotation, DicomInstance])],
  controllers: [ImageAnnotationsController],
  providers: [
    ImageAnnotationsService,
    ImageAnotationsRepository,
    DicomInstancesRepository,
  ],
  exports: [BackendEntitiesModule],
})
export class ImageAnnotationsModule {}
