import { PartialType } from '@nestjs/swagger';
import { CreateWeeklySchedulePatternDto } from './create-weekly-schedule-pattern.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateWeeklySchedulePatternDto extends PartialType(
  OmitType(CreateWeeklySchedulePatternDto, ['userId'] as const)
) {}