import { Module } from '@nestjs/common';
import { PatientServiceModule as PatientModule } from './patients/patients.module';
import { PatientConditionModule } from './patient-conditions/patient-conditions.module';
import { PatientEncounterModule } from './patient-encounters/patient-encounters.module';

@Module({
  imports: [
    PatientModule,
    PatientConditionModule,
    PatientEncounterModule,
  ],
  exports: [PatientModule, PatientConditionModule, PatientEncounterModule],
})
export class PatientServiceModule {}
