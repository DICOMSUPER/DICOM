import { Module } from '@nestjs/common';
import { ImagingModalitiesController } from './imaging-modalities.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [ImagingModalitiesController],
})
export class ImagingModalitiesModule {}
