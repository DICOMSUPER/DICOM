import { IsUUID, IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EncounterType } from '@backend/shared-enums';
import type { VitalSignsCollection } from '@backend/shared-interfaces';

export class CreatePatientEncounterDto {
  @IsUUID()
  patientId!: string;

  @IsDateString()
  encounterDate!: string;

  @IsEnum(EncounterType)
  encounterType!: EncounterType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  symptoms?: string;

  @IsOptional()
  vitalSigns?: VitalSignsCollection;

  @IsOptional()
  @IsUUID()
  assignedPhysicianId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
