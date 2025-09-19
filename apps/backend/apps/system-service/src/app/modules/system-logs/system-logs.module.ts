import { Module } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { SystemLogsController } from './system-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { SystemLog } from '@backend/shared-domain';
import { PaginationService } from '@backend/database';
import { BackendRedisModule } from '@backend/redis';

@Module({
  imports: [TypeOrmModule.forFeature([SystemLog]), BackendRedisModule],
  controllers: [SystemLogsController],
  providers: [SystemLogsService, PaginationService],
})
export class SystemLogsModule {}
