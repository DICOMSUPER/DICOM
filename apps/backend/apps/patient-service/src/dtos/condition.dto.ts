import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { ClinicalStatus, ConditionVerificationStatus } from '../entities/patient-condition.entity';

export class CreateConditionDto {
  @IsString()
  patientId!: string;

  @IsString()
  code!: string;

  @IsString()
  @IsOptional()
  codeSystem?: string;

  @IsString()
  @IsOptional()
  codeDisplay?: string;

  @IsEnum(ClinicalStatus)
  @IsOptional()
  clinicalStatus?: ClinicalStatus;

  @IsEnum(ConditionVerificationStatus)
  @IsOptional()
  verificationStatus?: ConditionVerificationStatus;

  @IsDate()
  @IsOptional()
  onsetDate?: Date;

  @IsDate()
  @IsOptional()
  abatementDate?: Date;

  @IsString()
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  stageSummary?: string;

  @IsString()
  @IsOptional()
  bodySite?: string;

  @IsDate()
  @IsOptional()
  recordedDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateConditionDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  codeSystem?: string;

  @IsString()
  @IsOptional()
  codeDisplay?: string;

  @IsEnum(ClinicalStatus)
  @IsOptional()
  clinicalStatus?: ClinicalStatus;

  @IsEnum(ConditionVerificationStatus)
  @IsOptional()
  verificationStatus?: ConditionVerificationStatus;

  @IsDate()
  @IsOptional()
  onsetDate?: Date;

  @IsDate()
  @IsOptional()
  abatementDate?: Date;

  @IsString()
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  stageSummary?: string;

  @IsString()
  @IsOptional()
  bodySite?: string;

  @IsDate()
  @IsOptional()
  recordedDate?: Date;

  @IsString()
  @IsOptional()
  asserterId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}


