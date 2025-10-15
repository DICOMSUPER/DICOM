import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateBreakTimeDto {
  @IsString()
  breakName!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsUUID()
  workingHoursId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
