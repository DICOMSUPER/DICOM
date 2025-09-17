import { Module } from '@nestjs/common';
import { DicomInstancesService } from './dicom-instances.service';
import { DicomInstancesController } from './dicom-instances.controller';

@Module({
  controllers: [DicomInstancesController],
  providers: [DicomInstancesService],
})
export class DicomInstancesModule {}
