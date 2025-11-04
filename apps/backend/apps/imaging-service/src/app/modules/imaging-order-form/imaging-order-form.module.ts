import { BackendEntitiesModule } from '@backend/entities';
import { ImagingOrder, ImagingOrderForm } from '@backend/shared-domain';
import { Module } from '@nestjs/common';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';

import { ImagingOrdersModule } from '../imaging-orders/imaging-orders.module';
import { ImagingOrderFormController } from './imaging-order-form.controller';
import { ImagingOrderFormRepository } from './imaging-order-form.repository';
import { ImagingOrderFormService } from './imaging-order-form.service';
import { PatientServiceClientModule } from '@backend/shared-client';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([ImagingOrder, ImagingOrderForm]),
    ImagingOrdersModule,
    PatientServiceClientModule,
    BackendRedisModule,
  ],
  controllers: [ImagingOrderFormController],
  providers: [
    ImagingOrderFormService,
    ImagingOrderFormRepository,
    ImagingModalityRepository,
  ],
  exports: [BackendEntitiesModule,PatientServiceClientModule],
})
export class ImagingOrderFormModule {}
