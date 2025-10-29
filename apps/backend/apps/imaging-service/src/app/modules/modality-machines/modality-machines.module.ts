import { Module } from '@nestjs/common';
import { ModalityMachinesService } from './modality-machines.service';
import { ModalityMachinesController } from './modality-machines.controller';
import { ModalityMachinesRepository } from './modality-machines.repository';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';

@Module({
  controllers: [ModalityMachinesController],
  providers: [
    ModalityMachinesService,
    ModalityMachinesRepository,
    ImagingModalityRepository,
  ],
})
export class ModalityMachinesModule {}
