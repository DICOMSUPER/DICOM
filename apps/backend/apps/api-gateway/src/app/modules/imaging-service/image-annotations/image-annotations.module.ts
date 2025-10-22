import { Module } from '@nestjs/common';
import { ImageAnnotationsController } from './image-annotations.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [ImageAnnotationsController],
})
export class ImageAnnotationsModule {}
