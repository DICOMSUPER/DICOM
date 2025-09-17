import { Module } from '@nestjs/common';
import { ScheduleReplacementsService } from './schedule-replacements.service';
import { ScheduleReplacementsController } from './schedule-replacements.controller';

@Module({
  controllers: [ScheduleReplacementsController],
  providers: [ScheduleReplacementsService],
})
export class ScheduleReplacementsModule {}
