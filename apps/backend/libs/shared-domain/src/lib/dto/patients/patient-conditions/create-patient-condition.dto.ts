import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, ValidateNested, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ClinicalStatus, ConditionVerificationStatus } from '@backend/shared-enums';
import { ConditionStageDto } from './condition-stage.dto';

export class CreatePatientConditionDto {
  @IsUUID()
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
  @ValidateNested()
  @Type(() => ConditionStageDto)
  stage?: ConditionStageDto;

  @IsOptional()
  @IsDateString()
  recordedDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
