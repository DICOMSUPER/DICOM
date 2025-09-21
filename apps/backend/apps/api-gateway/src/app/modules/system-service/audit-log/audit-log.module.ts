import { Module } from '@nestjs/common';
import { AuditLogController } from './audit-log.controller';
import { SystemServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [SystemServiceClientModule],
  controllers: [AuditLogController],
})
export class AuditLogModule {}