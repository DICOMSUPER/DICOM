import { IsString, IsOptional, IsNumber, MaxLength, Min, Max } from 'class-validator';

export class ConditionStageDto {
  @IsString()
  @MaxLength(50)
  stage!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  severity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bodySite?: string;
}
