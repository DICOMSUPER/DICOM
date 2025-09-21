import { Module } from '@nestjs/common';
import { SystemLogsController } from './system-logs.controller';
import { SystemServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [SystemServiceClientModule],
  controllers: [SystemLogsController],
})
export class SystemLogsModule {}
