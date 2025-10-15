import { Module } from '@nestjs/common';
import { PatientServiceModule as PatientModule } from './patients/patients.module';
import { PatientConditionModule } from './patient-conditions/patient-conditions.module';
import { PatientEncounterModule } from './patient-encounters/patient-encounters.module';
import { QueueAssignmentModule } from './queue-assignment/queue-assignment.module';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [
    PatientModule,
    PatientConditionModule,
    PatientEncounterModule,
    QueueAssignmentModule,
    
  ],
  exports: [
    PatientModule,
    PatientConditionModule,
    PatientEncounterModule,
    QueueAssignmentModule,
  ],
})
export class PatientServiceModule {}
