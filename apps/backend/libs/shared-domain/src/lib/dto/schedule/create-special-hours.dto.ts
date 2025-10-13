import { IsString, IsOptional, IsBoolean, IsUUID, IsDateString } from 'class-validator';

export class CreateSpecialHoursDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  isHoliday?: boolean;

  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
