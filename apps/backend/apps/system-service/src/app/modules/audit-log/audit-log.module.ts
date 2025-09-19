import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '@backend/shared-domain';

@Module({
  imports: [
    // Add any necessary imports here 
    TypeOrmModule.forFeature([
      // Add your entities here
      AuditLog
    ]),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
})
export class AuditLogModule {}
