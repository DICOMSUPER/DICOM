import { IsString, IsEnum, IsDateString, IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { LeaveType, LeaveStatus } from '../../entities/schedule/leave-requests.entity';

export class CreateLeaveRequestDto {
  @IsUUID()
  employee_id: string;

  @IsEnum(LeaveType)
  leave_type: LeaveType;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsNumber()
  @Min(0.5)
  @Max(365)
  total_days: number;

  @IsString()
  reason: string;
}

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsEnum(LeaveType)
  leave_type?: LeaveType;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(365)
  total_days?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(LeaveStatus)
  leave_status?: LeaveStatus;

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}

export class LeaveRequestSearchFilters {
  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsEnum(LeaveType)
  leave_type?: LeaveType;

  @IsOptional()
  @IsEnum(LeaveStatus)
  leave_status?: LeaveStatus;

  @IsOptional()
  @IsDateString()
  start_date_from?: string;

  @IsOptional()
  @IsDateString()
  start_date_to?: string;

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
