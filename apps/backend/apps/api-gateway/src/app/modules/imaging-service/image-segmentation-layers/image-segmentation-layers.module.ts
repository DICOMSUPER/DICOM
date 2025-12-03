import { Module } from '@nestjs/common';
import { ImageSegmentationLayersController } from './image-segmentation-layers.controller';
import {
  ImagingServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    ImagingServiceClientModule,
    UserServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [ImageSegmentationLayersController],
})
export class ImageSegmentationLayersModule {}
