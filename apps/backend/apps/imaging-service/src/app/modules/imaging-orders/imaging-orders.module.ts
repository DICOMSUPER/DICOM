import { Module } from '@nestjs/common';
import { ImagingOrdersService } from './imaging-orders.service';
import { ImagingOrdersController } from './imaging-orders.controller';
import { ImagingOrder } from './entities/imaging-order.entity';
import { ImagingModality } from '../imaging-modalities/entities/imaging-modality.entity';
import { BackendEntitiesModule } from '@backend/entities';

@Module({
  imports: [BackendEntitiesModule.forFeature([ImagingOrder, ImagingModality])],
  controllers: [ImagingOrdersController],
  providers: [ImagingOrdersService],
  exports: [BackendEntitiesModule],
})
export class ImagingOrdersModule {}
