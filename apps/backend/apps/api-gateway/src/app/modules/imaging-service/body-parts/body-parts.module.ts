import { Module } from '@nestjs/common';
import { BodyPartsController } from './body-parts.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [BodyPartsController],
})
export class BodyPartsModule {}
