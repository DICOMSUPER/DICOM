import { Module } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { SystemLogsController } from './system-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { SystemLog } from './entities/system-log.entity';

@Module({

  imports: [
    // Add any necessary imports here
    TypeOrmModule.forFeature([
      // Add your entities here
      SystemLog
    ]),
  ],
  controllers: [SystemLogsController],
  providers: [SystemLogsService],
})
export class SystemLogsModule {}
