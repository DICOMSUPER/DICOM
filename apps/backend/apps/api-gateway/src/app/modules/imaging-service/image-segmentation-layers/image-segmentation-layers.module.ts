import { Module } from '@nestjs/common';
import { ImageSegmentationLayersController } from './image-segmentation-layers.controller';
import {
  ImagingServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [
    ImagingServiceClientModule,
    UserServiceClientModule,
    SharedInterceptorModule,
  ],
  controllers: [ImageSegmentationLayersController],
})
export class ImageSegmentationLayersModule {}
