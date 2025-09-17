import { Module } from '@nestjs/common';
import { PrescriptionItemsService } from './prescription-items.service';
import { PrescriptionItemsController } from './prescription-items.controller';

@Module({
  controllers: [PrescriptionItemsController],
  providers: [PrescriptionItemsService],
})
export class PrescriptionItemsModule {}
