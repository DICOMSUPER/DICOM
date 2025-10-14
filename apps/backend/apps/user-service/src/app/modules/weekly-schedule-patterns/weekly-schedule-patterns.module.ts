import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklySchedulePatternsService } from './weekly-schedule-patterns.service';
import { WeeklySchedulePatternsController } from './weekly-schedule-patterns.controller';
import { WeeklySchedulePattern, WeeklySchedulePatternRepository } from '@backend/shared-domain';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklySchedulePattern])],
  controllers: [WeeklySchedulePatternsController],
  providers: [WeeklySchedulePatternsService, WeeklySchedulePatternRepository],
  exports: [WeeklySchedulePatternsService],
})
export class WeeklySchedulePatternsModule {}
