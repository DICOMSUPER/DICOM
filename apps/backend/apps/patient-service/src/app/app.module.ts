import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './modules/patients/patients.module';
import { PatientEncounterModule } from './modules/patient-encounters/patient-encounters.module';
import { PatientConditionModule } from './modules/patient-conditions/patient-conditions.module';
import { DiagnosesReportModule } from './modules/diagnoses-reports/diagnoses-reports.module';
import { DatabaseModule } from '@backend/database';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { SeedingModule } from './modules/seeding/seeding.module';
import { ReportTemplatesModule } from './modules/report-templates/report-templates.module';
import { BackendRedisModule } from '@backend/redis';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PatientModule,
    PatientEncounterModule,
    PatientConditionModule,
    DiagnosesReportModule,
    ReportTemplatesModule,
    DatabaseModule.forService({
      prefix: 'PATIENT',
      defaultDbName: 'dicom_patient_service',
    }),
    TypeOrmModule,
    SeedingModule,
    BackendRedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
