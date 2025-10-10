import { IsString, IsOptional, IsEnum, IsDateString, MaxLength, MinLength } from 'class-validator';
import { ClinicalStatus, ConditionVerificationStatus } from '@backend/shared-enums';

export class CreatePatientConditionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  patientId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  codeSystem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  codeDisplay?: string;

  @IsOptional()
  @IsEnum(ClinicalStatus)
  clinicalStatus?: ClinicalStatus;

  @IsOptional()
  @IsEnum(ConditionVerificationStatus)
  verificationStatus?: ConditionVerificationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  severity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  stageSummary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bodySite?: string;

  @IsOptional()
  @IsDateString()
  recordedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
