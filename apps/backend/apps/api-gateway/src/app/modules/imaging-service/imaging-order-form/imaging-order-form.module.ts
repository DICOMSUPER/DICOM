import {
  ImagingServiceClientModule,
  UserServiceClientModule
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { Module } from '@nestjs/common';
import { ImagingOrderFormController } from './imaging-order-form.controller';

@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
    UserServiceClientModule
  ],
  controllers: [ImagingOrderFormController],
})
export class ImagingOrderFormModule {}
