import { Module } from '@nestjs/common';
import { ImagingOrdersService } from './imaging-orders.service';
import { ImagingOrdersController } from './imaging-orders.controller';
import { ImagingOrder } from './entities/imaging-order.entity';
import { ImagingModality } from '../imaging-modalities/entities/imaging-modality.entity';
import { BackendEntitiesModule } from '@backend/entities';
import { ImagingOrderRepository } from './imaging-orders.repository';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';

@Module({
  imports: [BackendEntitiesModule.forFeature([ImagingOrder, ImagingModality])],
  controllers: [ImagingOrdersController],
  providers: [
    ImagingOrdersService,
    ImagingOrderRepository,
    ImagingModalityRepository,
  ],
  exports: [BackendEntitiesModule],
})
export class ImagingOrdersModule {}
