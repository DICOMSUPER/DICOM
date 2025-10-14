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
import { UserModule } from './modules/user-service/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from '@backend/auth-guards';
import { AuthGuardsModule } from '@backend/auth-guards';
import { UserServiceModule } from './modules/user-service/user-service.module';
dotenv.config();

@Module({
  imports: [
    AuthGuardsModule,
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
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
