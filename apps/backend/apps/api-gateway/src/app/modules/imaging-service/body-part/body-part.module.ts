import { Module } from '@nestjs/common';
import { BodyPartController } from './body-part.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [BodyPartController],
})
export class BodyPartModule {}
