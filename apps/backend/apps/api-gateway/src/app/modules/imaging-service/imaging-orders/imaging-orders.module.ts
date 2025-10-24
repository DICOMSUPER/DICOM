import { Module } from '@nestjs/common';
import { ImagingOrdersController } from './imaging-orders.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [ImagingOrdersController],
})
export class ImagingOrdersModule {}
