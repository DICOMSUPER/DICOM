import { Module } from '@nestjs/common';
import { PatientConditionController } from './patient-conditions.controller';
import { PatientServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [
    PatientServiceClientModule,
    SharedInterceptorModule,
    BackendRedisModule,
  ],
  controllers: [PatientConditionController],
})
export class PatientConditionModule {}
