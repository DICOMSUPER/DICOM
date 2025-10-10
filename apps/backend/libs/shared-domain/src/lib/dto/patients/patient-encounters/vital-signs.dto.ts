import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class VitalSignsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  systolicBloodPressure?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  diastolicBloodPressure?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  heartRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  respiratoryRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(45)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  oxygenSaturation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  height?: number;
}
