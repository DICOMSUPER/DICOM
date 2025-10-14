import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsUUID, IsTimeZone } from 'class-validator';
import { DayOfWeek } from '@backend/shared-enums';

export class CreateWeeklySchedulePatternDto {
  @IsUUID()
  userId!: string;

  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsOptional()
  @IsUUID()
  shiftTemplateId?: string;

  @IsOptional()
  @IsString()
  @IsTimeZone()
  customStartTime?: string;

  @IsOptional()
  @IsString()
  @IsTimeZone()
  customEndTime?: string;

  @IsOptional()
  @IsBoolean()
  isWorkingDay?: boolean;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
