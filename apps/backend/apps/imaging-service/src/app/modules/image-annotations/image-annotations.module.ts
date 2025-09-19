import { Module } from '@nestjs/common';
import { ImageAnnotationsService } from './image-annotations.service';
import { ImageAnnotationsController } from './image-annotations.controller';
import { ImageAnnotation } from './entities/image-annotation.entity';
import { DicomInstance } from '../dicom-instances/entities/dicom-instance.entity';
import { BackendEntitiesModule } from '@backend/entities';

@Module({
  imports: [BackendEntitiesModule.forFeature([ImageAnnotation, DicomInstance])],
  controllers: [ImageAnnotationsController],
  providers: [ImageAnnotationsService],
  exports: [BackendEntitiesModule],
})
export class ImageAnnotationsModule {}
