import { Module } from '@nestjs/common';
import { DicomSeriesService } from './dicom-series.service';
import { DicomSeriesController } from './dicom-series.controller';

@Module({
  controllers: [DicomSeriesController],
  providers: [DicomSeriesService],
})
export class DicomSeriesModule {}
