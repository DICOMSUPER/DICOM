import {
  DiagnosisStatus,
  DiagnosisType,
  Severity,
} from '@backend/shared-enums';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength
} from 'class-validator';

export class CreateDiagnosesReportDto {
  @IsUUID()
  encounterId!: string;

  @IsUUID()
  studyId!: string;

  @IsString()
  @IsOptional()
  diagnosisName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiagnosisType)
  diagnosisType!: DiagnosisType;

  @IsOptional()
  @IsEnum(DiagnosisStatus)
  diagnosisStatus?: DiagnosisStatus = DiagnosisStatus.DRAFT;

  @IsEnum(Severity)
  @IsOptional()
  severity?: Severity = Severity.MILD;

  @IsDateString()
  @IsOptional()
  diagnosisDate?: string = new Date().toISOString().split('T')[0];

  @IsUUID()
  @IsOptional() //Extract from token later
  diagnosedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsUUID()
  @IsOptional()
  signatureId?: string;
}
