import { Module } from '@nestjs/common';
import { PrescriptionItemService } from './prescription-items.service';
import { PrescriptionItemController } from './prescription-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionItem } from '@backend/shared-domain';

@Module({
    imports: [TypeOrmModule.forFeature([PrescriptionItem])],
  controllers: [PrescriptionItemController],
  providers: [PrescriptionItemService],
})
export class PrescriptionItemModule {}
