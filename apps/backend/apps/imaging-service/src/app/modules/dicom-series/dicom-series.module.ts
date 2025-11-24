import { Module } from '@nestjs/common';
import { DicomSeriesService } from './dicom-series.service';
import { DicomSeriesController } from './dicom-series.controller';
import { DicomSeries } from '@backend/shared-domain';
import { DicomStudy } from '@backend/shared-domain';
import { DicomInstance } from '@backend/shared-domain';
import { BackendEntitiesModule } from '@backend/database';
import { DicomSeriesRepository } from './dicom-series.repository';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([DicomSeries, DicomStudy, DicomInstance]),
  ],
  controllers: [DicomSeriesController],
  providers: [
    DicomSeriesService,
    DicomSeriesRepository,
    DicomStudiesRepository,
    DicomInstancesRepository,
  ],
  exports: [BackendEntitiesModule],
})
export class DicomSeriesModule {}
