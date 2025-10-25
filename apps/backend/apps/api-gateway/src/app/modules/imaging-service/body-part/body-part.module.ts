import { Module } from '@nestjs/common';
import { BodyPartController } from './body-part.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [BodyPartController],
})
export class BodyPartModule {}
