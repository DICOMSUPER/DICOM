import { Module } from '@nestjs/common';
import { DicomStudiesService } from './dicom-studies.service';
import { DicomStudiesController } from './dicom-studies.controller';

@Module({
  controllers: [DicomStudiesController],
  providers: [DicomStudiesService],
})
export class DicomStudiesModule {}
