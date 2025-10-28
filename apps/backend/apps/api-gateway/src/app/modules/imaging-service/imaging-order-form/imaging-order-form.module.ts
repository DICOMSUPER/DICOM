import { Module } from '@nestjs/common';
import { ImagingOrderFormController } from './imaging-order-form.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [ImagingOrderFormController],
})

export class ImagingOrderFormModule {}
