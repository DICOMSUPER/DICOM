import { Module } from '@nestjs/common';
import { ImagingOrdersService } from './imaging-orders.service';
import { ImagingOrdersController } from './imaging-orders.controller';

@Module({
  controllers: [ImagingOrdersController],
  providers: [ImagingOrdersService],
})
export class ImagingOrdersModule {}
