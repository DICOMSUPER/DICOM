import { Module } from '@nestjs/common';
import { DicomSeriesService } from './dicom-series.service';
import { DicomSeriesController } from './dicom-series.controller';
import { DicomSeries } from './entities/dicom-series.entity';
import { DicomStudy } from '../dicom-studies/entities/dicom-study.entity';
import { DicomInstance } from '../dicom-instances/entities/dicom-instance.entity';
import { BackendEntitiesModule } from '@backend/entities';

@Module({
  imports: [
    BackendEntitiesModule.forFeature([DicomSeries, DicomStudy, DicomInstance]),
  ],
  controllers: [DicomSeriesController],
  providers: [DicomSeriesService],
  exports: [BackendEntitiesModule],
})
export class DicomSeriesModule {}
