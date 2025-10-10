import { IsString, IsDate, IsEnum, IsOptional, IsBoolean, IsUUID, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DiagnosisType, DiagnosisStatus, Severity } from '@backend/shared-enums';

export class CreateDiagnosisReportDto {
  @IsUUID()
  encounterId!: string;

  @IsUUID()
  studyId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  diagnosisName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(DiagnosisType)
  diagnosisType!: DiagnosisType;

  @IsOptional()
  @IsEnum(DiagnosisStatus)
  diagnosisStatus?: DiagnosisStatus = DiagnosisStatus.ACTIVE;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsDateString()
  diagnosisDate!: string;

  @IsUUID()
  diagnosedBy!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  followupRequired?: boolean = false;

  @IsOptional()
  @IsBoolean()
  followUpInstructions?: boolean = false;
}
