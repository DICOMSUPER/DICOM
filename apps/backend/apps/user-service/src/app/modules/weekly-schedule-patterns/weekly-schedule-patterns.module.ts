import { Module } from '@nestjs/common';
import { WeeklySchedulePatternsService } from './weekly-schedule-patterns.service';
import { WeeklySchedulePatternsController } from './weekly-schedule-patterns.controller';

@Module({
  controllers: [WeeklySchedulePatternsController],
  providers: [WeeklySchedulePatternsService],
})
export class WeeklySchedulePatternsModule {}
