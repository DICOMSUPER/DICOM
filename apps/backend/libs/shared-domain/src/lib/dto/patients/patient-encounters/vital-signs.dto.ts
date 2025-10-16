import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VitalSignsDto {
  @ApiPropertyOptional({
    description: 'Systolic Blood Pressure in mmHg',
    example: 120,
    minimum: 0,
    maximum: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  bpSystolic?: number;

  @ApiPropertyOptional({
    description: 'Diastolic Blood Pressure in mmHg',
    example: 80,
    minimum: 0,
    maximum: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  bpDiastolic?: number;

  @ApiPropertyOptional({
    description: 'Heart Rate in beats per minute',
    example: 72,
    minimum: 0,
    maximum: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  heartRate?: number;

  @ApiPropertyOptional({
    description: 'Respiratory Rate in breaths per minute',
    example: 16,
    minimum: 0,
    maximum: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  respiratoryRate?: number;

  @ApiPropertyOptional({
    description: 'Body Temperature in Celsius',
    example: 37.0,
    minimum: 30,
    maximum: 45,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(45)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Oxygen Saturation in percentage',
    example: 98,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  oxygenSaturation?: number;

  @ApiPropertyOptional({
    description: 'Body Weight in kg',
    example: 70.5,
    minimum: 0,
    maximum: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Body Height in cm',
    example: 175,
    minimum: 0,
    maximum: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  height?: number;

  @ApiPropertyOptional({
    description: 'Body Mass Index (calculated from weight and height)',
    example: 23.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bmi?: number;

  @ApiPropertyOptional({
    description: 'Blood Glucose level in mg/dL',
    example: 95,
    minimum: 0,
    maximum: 600,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(600)
  glucose?: number;

  @ApiPropertyOptional({
    description: 'Pain Scale (0 = No pain, 10 = Worst pain)',
    example: 3,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  painScale?: number;
}