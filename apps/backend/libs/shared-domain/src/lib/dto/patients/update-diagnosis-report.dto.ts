import { IsString, IsDate, IsEnum, IsOptional, IsBoolean, IsUUID, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DiagnosisType, DiagnosisStatus, Severity } from '@backend/shared-enums';

export class UpdateDiagnosisReportDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  diagnosisName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(DiagnosisType)
  diagnosisType?: DiagnosisType;

  @IsOptional()
  @IsEnum(DiagnosisStatus)
  diagnosisStatus?: DiagnosisStatus;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsDateString()
  diagnosisDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  followupRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  followUpInstructions?: boolean;
}
