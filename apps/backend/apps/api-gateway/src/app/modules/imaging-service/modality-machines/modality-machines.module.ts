import { Module } from '@nestjs/common';
import { ModalityMachinesController } from './modality-machines.controller';
import { ImagingServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    ImagingServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [ModalityMachinesController],
})
export class ModalityMachinesModule {}
