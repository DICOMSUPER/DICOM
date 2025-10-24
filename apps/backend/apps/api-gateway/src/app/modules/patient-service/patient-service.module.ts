import { Module } from '@nestjs/common';
import { PatientServiceModule as PatientModule } from './patients/patients.module';
import { PatientConditionModule } from './patient-conditions/patient-conditions.module';
import { PatientEncounterModule } from './patient-encounters/patient-encounters.module';
import { QueueAssignmentModule } from './queue-assignment/queue-assignment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { DiagnosisReportsModule } from './diagnosis-reports/diagnosis-reports.module';

@Module({
  imports: [
    ClientsModule.register([
      getClient('USER_SERVICE', Transport.TCP, 'localhost', 5002),
    ]),
    PatientModule,
    PatientConditionModule,
    PatientEncounterModule,
    QueueAssignmentModule,
    DiagnosisReportsModule,
  ],
  exports: [
    PatientModule,
    PatientConditionModule,
    PatientEncounterModule,
    QueueAssignmentModule,
  ],
})
export class PatientServiceModule {}
