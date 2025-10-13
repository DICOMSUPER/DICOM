import { IsOptional, IsString, IsUUID, IsEnum, IsNumber } from 'class-validator';
import { ScheduleStatus } from '@backend/shared-enums';

export class EmployeeScheduleSearchFilters {
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsString()
  workDateFrom?: string;

  @IsOptional()
  @IsString()
  workDateTo?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  scheduleStatus?: ScheduleStatus;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
