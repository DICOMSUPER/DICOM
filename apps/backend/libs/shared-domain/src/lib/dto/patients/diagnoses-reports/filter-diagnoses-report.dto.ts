import { PaginationDto } from '@backend/database';
import {
  DiagnosisStatus,
  DiagnosisType,
  Severity,
} from '@backend/shared-enums';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterDiagnosesReportDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsUUID()
  studyId?: string;

  @IsOptional()
  @IsString()
  diagnosisName?: string;

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
  @Type(() => Date)
  @IsDate()
  diagnosisDateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  diagnosisDateTo?: Date;

  @IsOptional()
  @IsUUID()
  diagnosedBy?: string;

  @IsOptional()
  @IsUUID()
  reportTemplateId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
