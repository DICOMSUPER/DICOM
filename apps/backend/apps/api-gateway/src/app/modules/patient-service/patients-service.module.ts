import { Module } from '@nestjs/common';
import { PatientServiceModule } from './patients/patients.module';
import { PatientConditionModule } from './patient-conditions/patient-conditions.module';

@Module({
  imports: [
    PatientServiceModule,
    PatientConditionModule,
  ],
})
export class PatientsServiceModule {}
