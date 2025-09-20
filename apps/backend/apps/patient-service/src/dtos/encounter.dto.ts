import { IsString, IsEnum, IsOptional, IsJSON } from 'class-validator';
import { EncounterType, EncounterStatus } from '../entities/patient-encounter.entity';

export class CreateEncounterDto {
  @IsString()
  patientId!: string;

  @IsEnum(EncounterType)
  encounterType!: EncounterType;

  @IsEnum(EncounterStatus)
  @IsOptional()
  status?: EncounterStatus;

  @IsString()
  @IsOptional()
  chiefComplaint?: string;

  @IsString()
  @IsOptional()
  symptoms?: string;

  @IsJSON()
  @IsOptional()
  vitalSigns?: Record<string, any>;

  @IsString()
  @IsOptional()
  assignedPhysicianId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEncounterDto {
  @IsEnum(EncounterType)
  @IsOptional()
  encounterType?: EncounterType;

  @IsEnum(EncounterStatus)
  @IsOptional()
  status?: EncounterStatus;

  @IsString()
  @IsOptional()
  chiefComplaint?: string;

  @IsString()
  @IsOptional()
  symptoms?: string;

  @IsJSON()
  @IsOptional()
  vitalSigns?: Record<string, any>;

  @IsString()
  @IsOptional()
  assignedPhysicianId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}