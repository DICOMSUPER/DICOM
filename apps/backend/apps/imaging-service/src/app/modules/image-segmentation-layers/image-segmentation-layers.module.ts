import { Module } from '@nestjs/common';
import { ImageSegmentationLayersController } from './image-segmentation-layers.controller';
import { ImageSegmentationLayersService } from './image-segmentation-layers.service';
import { ImageSegmentationLayersRepository } from './image-segmentation-layers.repository';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';

@Module({
  controllers: [ImageSegmentationLayersController],
  providers: [
    ImageSegmentationLayersService,
    ImageSegmentationLayersRepository,
    DicomInstancesRepository,
  ],
})
export class ImageSegmentationLayersModule {}
