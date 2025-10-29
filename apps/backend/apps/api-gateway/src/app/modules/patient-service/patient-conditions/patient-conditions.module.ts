import { Module } from '@nestjs/common';
import { PatientConditionController } from './patient-conditions.controller';
import { PatientServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [PatientServiceClientModule, SharedInterceptorModule],
  controllers: [PatientConditionController],
})
export class PatientConditionModule {}
