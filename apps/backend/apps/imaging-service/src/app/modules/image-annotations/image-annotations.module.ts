import { Module } from '@nestjs/common';
import { ImageAnnotationsService } from './image-annotations.service';
import { ImageAnnotationsController } from './image-annotations.controller';

@Module({
  controllers: [ImageAnnotationsController],
  providers: [ImageAnnotationsService],
})
export class ImageAnnotationsModule {}
