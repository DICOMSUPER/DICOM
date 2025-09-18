import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './modules/patients/patients.module';
import { PatientVisitsModule } from './modules/patient-visits/patient-visits.module';
import { QueueAssignmentsModule } from './modules/queue-assignments/queue-assignments.module';
import { MedicalHistoryModule } from './modules/medical-history/medical-history.module';
import { DiagnosesReportModule } from './modules/diagnoses-report/diagnoses-report.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { PrescriptionItemsModule } from './modules/prescription-items/prescription-items.module';
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
    PatientsModule,
    PatientVisitsModule,
    QueueAssignmentsModule,
    MedicalHistoryModule,
    DiagnosesReportModule,
    PrescriptionsModule,
    PrescriptionItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
