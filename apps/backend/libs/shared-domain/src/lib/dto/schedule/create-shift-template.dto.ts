import { IsString, IsEnum, IsOptional, IsBoolean, MaxLength, MinLength, Matches } from 'class-validator';
import { ShiftType } from '@backend/shared-enums';

export class CreateShiftTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  shift_name!: string;

  @IsEnum(ShiftType)
  shift_type!: ShiftType;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'start_time must be in HH:MM or HH:MM:SS format'
  })
  start_time!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'end_time must be in HH:MM or HH:MM:SS format'
  })
  end_time!: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'break_start_time must be in HH:MM or HH:MM:SS format'
  })
  break_start_time?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'break_end_time must be in HH:MM or HH:MM:SS format'
  })
  break_end_time?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}