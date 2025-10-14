import { IsString, IsEnum, IsTimeZone, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { ShiftType } from '@backend/shared-enums';

export class CreateShiftTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  shift_name!: string;

  @IsEnum(ShiftType)
  shift_type!: ShiftType;

  @IsString()
  @IsTimeZone()
  start_time!: string;

  @IsString()
  @IsTimeZone()
  end_time!: string;

  @IsOptional()
  @IsString()
  @IsTimeZone()
  break_start_time?: string;

  @IsOptional()
  @IsString()
  @IsTimeZone()
  break_end_time?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
