import { Module } from '@nestjs/common';
import { BackendEntitiesModule, User } from '@backend/entities';
import { DicomStudiesService } from './dicom-studies.service';
import { DicomStudiesController } from './dicom-studies.controller';
import { DicomStudy } from '@backend/shared-domain';
import { ImagingModality } from '@backend/shared-domain';
import { ImagingOrder } from '@backend/shared-domain';
import { DicomStudiesRepository } from './dicom-studies.repository';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import { ImagingOrderRepository } from '../imaging-orders/imaging-orders.repository';
import { BackendRedisModule } from '@backend/redis';
import { PatientServiceClientModule, UserServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([
      DicomStudy,
      ImagingModality,
      ImagingOrder,
    ]),
    BackendRedisModule,
    PatientServiceClientModule,
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
