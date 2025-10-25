import { Module } from '@nestjs/common';
import { PatientEncounterController } from './patient-encounters.controller';
import { PatientServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [PatientServiceClientModule, SharedInterceptorModule],
  controllers: [PatientEncounterController],
})
export class PatientEncounterModule {}
