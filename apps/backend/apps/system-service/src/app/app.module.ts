import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@backend/database';
import { AiAnalysesModule } from './modules/ai-analyses/ai-analyses.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SystemLogsModule } from './modules/system-logs/system-logs.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule.forService({
      prefix: 'SYSTEM',
      defaultDbName: 'dicom_system_service',
    }),
    AiAnalysesModule,
    AuditLogModule,
    NotificationsModule,
    SystemLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
