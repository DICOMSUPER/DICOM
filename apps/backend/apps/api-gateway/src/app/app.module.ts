import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImagingServiceModule } from './modules/imaging-service/imaging-service.module';
import { PatientServiceModule } from './modules/patient-service/patient-service.module';

import {
  ImagingServiceClientModule,
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { AuthGuard, RoleGuard } from '@backend/shared-guards';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DicomStudySignaturesModule } from './modules/imaging-service/dicom-study-signatures/dicom-study-signatures.module';
import { SeedingModule } from './modules/seeding/seeding.module';
import { AiAnalysisModule } from './modules/system-service/ai-analysis/ai-analysis.module';
import { NotificationsModule } from './modules/system-service/notifications/notifications.module';
import { UserServiceModule } from './modules/user-service/user-service.module';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ScheduleModule.forRoot(),

    // Client Modules for Microservices Communication
    UserServiceClientModule,
    PatientServiceClientModule,
    ImagingServiceClientModule,

    // Feature Modules
    UserServiceModule,
    ImagingServiceModule,

    AiAnalysisModule,

    NotificationsModule,
    PatientServiceModule,
    SeedingModule,
    DicomStudySignaturesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
