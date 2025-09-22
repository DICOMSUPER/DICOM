import { Module } from '@nestjs/common';
import { DicomInstancesService } from './dicom-instances.service';
import { DicomInstancesController } from './dicom-instances.controller';
import { DicomInstance } from '@backend/shared-domain';
import { DicomSeries } from '@backend/shared-domain';
import { BackendEntitiesModule } from '@backend/entities';
import { DicomInstancesRepository } from './dicom-instances.repository';
import { DicomSeriesRepository } from '../dicom-series/dicom-series.repository';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';

@Module({
  imports: [BackendEntitiesModule.forFeature([DicomInstance, DicomSeries])],
  controllers: [DicomInstancesController],
  providers: [
    DicomInstancesService,
    DicomInstancesRepository,
    DicomSeriesRepository,
    DicomStudiesRepository,
  ],
  exports: [BackendEntitiesModule],
})
export class DicomInstancesModule {}
