import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ReplacementStatus } from '@backend/shared-enums';

export class CreateScheduleReplacementDto {
  @IsUUID()
  originalEmployeeId!: string;

  @IsUUID()
  replacementEmployeeId!: string;

  @IsDateString()
  date!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(ReplacementStatus)
  status?: ReplacementStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
