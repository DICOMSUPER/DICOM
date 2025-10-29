import { Module } from '@nestjs/common';
import { ImagingOrdersController } from './imaging-orders.controller';
import {
  ImagingServiceClientModule,
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [
    ImagingServiceClientModule,
    PatientServiceClientModule,
    SharedInterceptorModule,
    UserServiceClientModule,
  ],
  controllers: [ImagingOrdersController],
})
export class ImagingOrdersModule {}
