import { Module } from '@nestjs/common';
import { PrescriptionItemsService } from './prescription-items.service';
import { PrescriptionItemsController } from './prescription-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionItem } from '@backend/shared-domain';

@Module({
    imports: [TypeOrmModule.forFeature([PrescriptionItem])],
  controllers: [PrescriptionItemsController],
  providers: [PrescriptionItemsService],
})
export class PrescriptionItemsModule {}
