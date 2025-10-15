import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleReplacementDto } from './create-schedule-replacement.dto';

export class UpdateScheduleReplacementDto extends PartialType(CreateScheduleReplacementDto) {}
