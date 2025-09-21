import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
import { AuthModule } from './modules/auth/auth.module';
import { ImagingServiceModule } from './modules/imaging-service/imaging-service.module';
import { PatientServiceModule } from './modules/patient-service/patient-service.module';
import dotenv from 'dotenv';
import { SystemLogsModule } from './modules/system-service/system-logs/system-logs.module';
import { AiAnalysisModule } from './modules/system-service/ai-analysis/ai-analysis.module';
import { AuditLogModule } from './modules/system-service/audit-log/audit-log.module';
import { NotificationsModule } from './modules/system-service/notifications/notifications.module';
dotenv.config();

@Module({
  imports: [
    ClientsModule.register([
      getClient(
        process.env.AUTH_SERVICE_NAME || 'AuthService',
        Number(process.env.AUTH_SERVICE_TRANSPORT || Transport.TCP),
        process.env.AUTH_SERVICE_HOST || 'localhost',
        Number(process.env.AUTH_SERVICE_PORT || 5001)
      ),
      getClient(
        process.env.USER_SERVICE_NAME || 'UserService',
        Number(process.env.USER_SERVICE_TRANSPORT || Transport.TCP),
        process.env.USER_SERVICE_HOST || 'localhost',
        Number(process.env.USER_SERVICE_PORT || 5002)
      ),
      getClient(
        process.env.IMAGE_SERVICE_NAME || 'ImageService',
        Number(process.env.IMAGE_SERVICE_TRANSPORT || Transport.TCP),
        process.env.IMAGE_SERVICE_HOST || 'localhost',
        Number(process.env.IMAGE_SERVICE_PORT || 5003)
      ),
      getClient(
        process.env.PATIENT_SERVICE_NAME || 'PatientService',
        Number(process.env.PATIENT_SERVICE_TRANSPORT || Transport.TCP),
        process.env.PATIENT_SERVICE_HOST || 'localhost',
        Number(process.env.PATIENT_SERVICE_PORT || 5004)
      ),
    ]),
    AuthModule,
    ImagingServiceModule,
    SystemLogsModule,
    AiAnalysisModule,
    AuditLogModule,
    NotificationsModule,
    PatientServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
