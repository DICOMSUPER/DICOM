import { IsString, IsEnum, IsTimeZone, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ShiftType } from '../../entities/schedule/shift-templates.entity';

export class CreateShiftTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  shift_name: string;

  @IsEnum(ShiftType)
  shift_type: ShiftType;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsOptional()
  @IsString()
  break_start_time?: string;

  @IsOptional()
  @IsString()
  break_end_time?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}

export class UpdateShiftTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  shift_name?: string;

  @IsOptional()
  @IsEnum(ShiftType)
  shift_type?: ShiftType;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsString()
  break_start_time?: string;

  @IsOptional()
  @IsString()
  break_end_time?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
