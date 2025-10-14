import { IsEnum, IsString, IsTimeZone, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { DayOfWeek } from '../../entities/users/working-hours.entity';

export class CreateWorkingHoursDto {
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;


  @IsOptional()
  @IsString()
  description?: string;
}
