import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklySchedulePatternDto } from './create-weekly-schedule-pattern.dto';

export class UpdateWeeklySchedulePatternDto extends PartialType(CreateWeeklySchedulePatternDto) {}
