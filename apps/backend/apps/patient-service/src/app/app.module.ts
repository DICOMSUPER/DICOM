import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './modules/patients/patients.module';
import { PatientEncounterModule } from './modules/patient-encounters/patient-encounters.module';
import { QueueAssignmentModule } from './modules/queue-assignments/queue-assignments.module';
import { PatientConditionModule } from './modules/patient-conditions/patient-conditions.module';
import { DiagnosesReportModule } from './modules/diagnoses-reports/diagnoses-reports.module';
import { PrescriptionModule } from './modules/prescriptions/prescriptions.module';
import { PrescriptionItemModule } from './modules/prescription-items/prescription-items.module';
import { DatabaseModule } from '@backend/database';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule.forService({
      prefix: 'PATIENT',
      defaultDbName: 'dicom_patient_service'

    }),
    PatientModule,
    PatientEncounterModule,
    QueueAssignmentModule,
    PatientConditionModule,
    DiagnosesReportModule,
    PrescriptionModule,
    PrescriptionItemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
