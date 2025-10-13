import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './modules/patients/patients.module';
import { PatientEncounterModule } from './modules/patient-encounters/patient-encounters.module';
import { QueueAssignmentModule } from './modules/queue-assignments/queue-assignments.module';
import { PatientConditionModule } from './modules/patient-conditions/patient-conditions.module';
import { DiagnosesReportModule } from './modules/diagnoses-reports/diagnoses-reports.module';
import { DatabaseModule } from '@backend/database';
import { ConfigModule } from '@nestjs/config';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { PatientServiceExceptionFilter } from './filters/exception.filter';
import { Transport } from '@nestjs/microservices/enums/transport.enum';
import { getClient } from '@backend/shared-utils';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule.forService({
      prefix: 'PATIENT',
      defaultDbName: 'dicom_patient_service',
    }),
    PatientModule,
    PatientEncounterModule,
    QueueAssignmentModule,
    PatientConditionModule,
    DiagnosesReportModule,
    
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: PatientServiceExceptionFilter,
    },
  ],
})
export class AppModule {}
