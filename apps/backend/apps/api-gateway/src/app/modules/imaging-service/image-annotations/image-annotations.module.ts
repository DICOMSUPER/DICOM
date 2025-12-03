import { Module } from '@nestjs/common';
import { ImageAnnotationsController } from './image-annotations.controller';
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
  controllers: [ImageAnnotationsController],
})
export class ImageAnnotationsModule {}
