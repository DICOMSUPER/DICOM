import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleReplacementsService } from './schedule-replacements.service';
import { ScheduleReplacementsController } from './schedule-replacements.controller';
import { ScheduleReplacement } from '@backend/shared-domain';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleReplacement])],
  controllers: [ScheduleReplacementsController],
  providers: [ScheduleReplacementsService],
  exports: [ScheduleReplacementsService],
})
export class ScheduleReplacementsModule {}
