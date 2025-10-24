import { Module } from '@nestjs/common';
import { ModalityMachinesController } from './modality-machines.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [ImagingServiceClientModule, SharedInterceptorModule],
  controllers: [ModalityMachinesController],
})
export class ModalityMachinesModule {}
