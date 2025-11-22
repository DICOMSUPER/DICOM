import { IsOptional, IsString, IsUUID, IsEnum, IsNumber } from 'class-validator';
import { ScheduleStatus } from '@backend/shared-enums';
import { Transform } from 'class-transformer';

export class RoomScheduleSearchFilters {
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => value || undefined)
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => value || undefined)
  roomId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  workDateFrom?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  workDateTo?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  startTime?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  endTime?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  @Transform(({ value }) => value || undefined)
  scheduleStatus?: ScheduleStatus;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  role?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  sortBy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  offset?: number;
}
