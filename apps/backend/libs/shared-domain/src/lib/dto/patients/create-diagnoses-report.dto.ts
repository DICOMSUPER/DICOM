import { IsString, IsOptional, IsEnum, IsUUID, IsDateString, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { DiagnosisStatus, DiagnosisType } from '@backend/shared-enums';
import { DiagnosisDto } from './diagnosis.dto';

export class CreateDiagnosesReportDto {
  @IsUUID()
  patientId!: string;

  @IsUUID()
  encounterId!: string;

  @IsDateString()
  reportDate!: string;

  @ValidateNested()
  @Type(() => DiagnosisDto)
  primaryDiagnosis!: DiagnosisDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisDto)
  secondaryDiagnoses?: DiagnosisDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  findings?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  recommendations?: string;

  @IsUUID()
  physicianId!: string;

  @IsOptional()
  @IsEnum(DiagnosisStatus)
  status?: DiagnosisStatus = DiagnosisStatus.FINAL;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
