import {
  ImagingServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { Module } from '@nestjs/common';
import { ImagingOrderFormController } from './imaging-order-form.controller';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
    UserServiceClientModule,
  ],
  controllers: [ImagingOrderFormController],
})
export class ImagingOrderFormModule {}
