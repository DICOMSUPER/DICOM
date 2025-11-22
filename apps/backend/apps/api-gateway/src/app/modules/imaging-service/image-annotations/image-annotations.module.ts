import { Module } from '@nestjs/common';
import { ImageAnnotationsController } from './image-annotations.controller';
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
  controllers: [ImageAnnotationsController],
})
export class ImageAnnotationsModule {}
