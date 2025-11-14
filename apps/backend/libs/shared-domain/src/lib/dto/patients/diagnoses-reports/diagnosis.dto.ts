import { DiagnosisType } from '@backend/shared-enums';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class DiagnosisDto {
  @IsString()
  @MaxLength(20)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(DiagnosisType)
  type?: DiagnosisType = DiagnosisType.PRIMARY;
}
