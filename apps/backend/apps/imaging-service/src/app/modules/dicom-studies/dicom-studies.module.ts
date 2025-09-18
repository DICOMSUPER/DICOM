import { Module } from '@nestjs/common';
import { BackendEntitiesModule } from '@backend/entities';
import { DicomStudiesService } from './dicom-studies.service';
import { DicomStudiesController } from './dicom-studies.controller';
import { DicomStudy } from './entities/dicom-study.entity';
import { ImagingModality } from '../imaging-modalities/entities/imaging-modality.entity';
import { ImagingOrder } from '../imaging-orders/entities/imaging-order.entity';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([
      DicomStudy,
      ImagingModality,
      ImagingOrder,
    ]),
  ],
  controllers: [DicomStudiesController],
  providers: [DicomStudiesService],
  exports: [BackendEntitiesModule],
})
export class DicomStudiesModule {}
