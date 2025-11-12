import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DiagnosisStatus,
  DiagnosisType,
  Severity,
} from '@backend/shared-enums';
import { DiagnosisDto } from './diagnosis.dto';

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
  diagnosisStatus?: DiagnosisStatus = DiagnosisStatus.ACTIVE;

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
  idSignature?: string;
}
