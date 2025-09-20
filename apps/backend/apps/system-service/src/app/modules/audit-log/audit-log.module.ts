import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '@backend/shared-domain';
import { PaginationService } from '@backend/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService, PaginationService],
})
export class AuditLogModule {}
