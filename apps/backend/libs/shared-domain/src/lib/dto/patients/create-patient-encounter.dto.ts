import { IsString, IsDate, IsEnum, IsOptional, IsBoolean, IsUUID, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
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
