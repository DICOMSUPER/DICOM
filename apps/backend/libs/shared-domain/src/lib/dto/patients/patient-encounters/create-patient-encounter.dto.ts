import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EncounterPriorityLevel, EncounterType } from '@backend/shared-enums';
import { VitalSignsDto } from './vital-signs.dto';

export class CreatePatientEncounterDto {
  @IsUUID()
  patientId!: string;

  @IsDateString()
  encounterDate!: string;

  @IsEnum(EncounterType)
  encounterType!: EncounterType;

  @IsOptional()
  @IsEnum(EncounterPriorityLevel)
  priority?: EncounterPriorityLevel = EncounterPriorityLevel.ROUTINE;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  symptoms?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;

  @IsOptional()
  @IsUUID()
  serviceRoomId?: string;

  @IsOptional()
  @IsUUID()
  assignedPhysicianId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
