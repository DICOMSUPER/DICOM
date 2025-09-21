import { Module } from '@nestjs/common';
import { BackendEntitiesModule } from '@backend/entities';
import { DicomStudiesService } from './dicom-studies.service';
import { DicomStudiesController } from './dicom-studies.controller';
import { DicomStudy } from './entities/dicom-study.entity';
import { ImagingModality } from '../imaging-modalities/entities/imaging-modality.entity';
import { ImagingOrder } from '../imaging-orders/entities/imaging-order.entity';
import { DicomStudiesRepository } from './dicom-studies.repository';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import { ImagingOrderRepository } from '../imaging-orders/imaging-orders.repository';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([
      DicomStudy,
      ImagingModality,
      ImagingOrder,
    ]),
  ],
  controllers: [DicomStudiesController],
  providers: [
    DicomStudiesService,
    DicomStudiesRepository,
    ImagingModalityRepository,
    ImagingOrderRepository,
  ],
  exports: [BackendEntitiesModule],
})
export class DicomStudiesModule {}
