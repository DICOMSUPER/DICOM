import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ImagingServiceModule } from './modules/imaging-service/imaging-service.module';
import { PatientServiceModule } from './modules/patient-service/patient-service.module';
import dotenv from 'dotenv';
import { SystemLogsModule } from './modules/system-service/system-logs/system-logs.module';
import { AiAnalysisModule } from './modules/system-service/ai-analysis/ai-analysis.module';
import { AuditLogModule } from './modules/system-service/audit-log/audit-log.module';
import { NotificationsModule } from './modules/system-service/notifications/notifications.module';
import { APP_GUARD } from '@nestjs/core';

import { UserServiceModule } from './modules/user-service/user-service.module';
import { RoomAssignmentsModule } from './modules/user-service/room-assignment/room-assignment.module';
import { AuthGuard } from '@backend/shared-guards';
import { RoleGuard } from '@backend/shared-guards';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),

    UserServiceModule,
    ImagingServiceModule,
    SystemLogsModule,
    AiAnalysisModule,
    AuditLogModule,
    NotificationsModule,
    PatientServiceModule,
    RoomAssignmentsModule,
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
