import { Module } from '@nestjs/common';
import { ImagingModalitiesController } from './imaging-modalities.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BackendRedisModule } from '@backend/redis';
@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [ImagingModalitiesController],
})
export class ImagingModalitiesModule {}
