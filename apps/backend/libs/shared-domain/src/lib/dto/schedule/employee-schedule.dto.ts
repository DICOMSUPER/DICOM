import { IsString, IsEnum, IsDateString, IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ScheduleStatus } from '../../entities/schedule/employee-schedules.entity';

export class CreateEmployeeScheduleDto {
  @IsUUID()
  employee_id: string;

  @IsOptional()
  @IsUUID()
  room_id?: string;

  @IsOptional()
  @IsUUID()
  shift_template_id?: string;

  @IsDateString()
  work_date: string;

  @IsOptional()
  @IsString()
  actual_start_time?: string;

  @IsOptional()
  @IsString()
  actual_end_time?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  schedule_status?: ScheduleStatus = ScheduleStatus.SCHEDULED;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  overtime_hours?: number = 0;
}

export class UpdateEmployeeScheduleDto {
  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsUUID()
  room_id?: string;

  @IsOptional()
  @IsUUID()
  shift_template_id?: string;

  @IsOptional()
  @IsDateString()
  work_date?: string;

  @IsOptional()
  @IsString()
  actual_start_time?: string;

  @IsOptional()
  @IsString()
  actual_end_time?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  schedule_status?: ScheduleStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  overtime_hours?: number;
}

export class EmployeeScheduleSearchFilters {
  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsUUID()
  room_id?: string;

  @IsOptional()
  @IsDateString()
  work_date_from?: string;

  @IsOptional()
  @IsDateString()
  work_date_to?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  schedule_status?: ScheduleStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
