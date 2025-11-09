import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ScheduleStatus } from '@backend/shared-enums';

export class CreateRoomScheduleDto {
  @IsOptional()
  @IsUUID()
  room_id?: string;

  @IsOptional()
  @IsUUID()
  shift_template_id?: string;

  @IsDateString()
  work_date!: string;

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
  overtime_hours?: number;

  @IsOptional()
  @IsUUID()
  created_by?: string;
}
