import { BackendEntitiesModule } from '@backend/entities';
import { ImagingModality, ImagingOrder } from '@backend/shared-domain';
import { Module } from '@nestjs/common';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import { ImagingOrdersController } from './imaging-orders.controller';
import { ImagingOrderRepository } from './imaging-orders.repository';
import { ImagingOrdersService } from './imaging-orders.service';
import { ImagingOrderFormRepository } from '../imaging-order-form/imaging-order-form.repository';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';

@Module({
  imports: [BackendEntitiesModule.forFeature([ImagingOrder, ImagingModality])],
  controllers: [ImagingOrdersController],
  providers: [
    ImagingOrdersService,
    ImagingOrderRepository,
    ImagingModalityRepository,
    ImagingOrderFormRepository,
    DicomStudiesRepository,
  ],
  exports: [BackendEntitiesModule, ImagingOrdersService],
})
export class ImagingOrdersModule {}
