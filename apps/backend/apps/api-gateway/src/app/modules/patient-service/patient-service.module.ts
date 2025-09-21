import { Module } from '@nestjs/common';
import { PatientServiceModule as PatientModule } from './patients/patients.module';
import { PatientConditionModule } from './patient-conditions/patient-conditions.module';

@Module({
  imports: [
    PatientModule,
    PatientConditionModule,
  ],
  exports: [PatientModule, PatientConditionModule],
})
export class PatientServiceModule {}
