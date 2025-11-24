import { BackendEntitiesModule } from '@backend/database';
import { ImagingModality, ImagingOrder } from '@backend/shared-domain';
import { Module } from '@nestjs/common';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import { ImagingOrdersController } from './imaging-orders.controller';
import { ImagingOrderRepository } from './imaging-orders.repository';
import { ImagingOrdersService } from './imaging-orders.service';
import { ImagingOrderFormRepository } from '../imaging-order-form/imaging-order-form.repository';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { ImagingOrdersCronJob } from './imaging-orders.cron';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([ImagingOrder, ImagingModality]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ImagingOrdersController],
  providers: [
    ImagingOrdersService,
    ImagingOrderRepository,
    ImagingModalityRepository,
    ImagingOrderFormRepository,
    DicomStudiesRepository,
    ImagingOrdersCronJob,
  ],
  exports: [BackendEntitiesModule, ImagingOrdersService],
})
export class ImagingOrdersModule {}
