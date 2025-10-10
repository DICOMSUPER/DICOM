import { IsString, IsDate, IsEnum, IsOptional, IsBoolean, IsUUID, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DiagnosisType, DiagnosisStatus, Severity } from '@backend/shared-enums';

export class DiagnosisSearchDto {
  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

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
  @IsUUID()
  diagnosedBy?: string;

  @IsOptional()
  @IsDateString()
  diagnosisDateFrom?: string;

  @IsOptional()
  @IsDateString()
  diagnosisDateTo?: string;

  @IsOptional()
  @IsString()
  diagnosisName?: string;

  @IsOptional()
  @IsBoolean()
  followupRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
