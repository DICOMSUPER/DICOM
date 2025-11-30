import { EncounterType } from '@backend/shared-enums';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { VitalSignsDto } from './vital-signs.dto';

export class UpdatePatientEncounterDto {
  @IsOptional()
  @IsDateString()
  encounterDate?: string;

  @IsOptional()
  @IsEnum(EncounterType)
  encounterType?: EncounterType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  symptoms?: string;

  @IsOptional()
  vitalSigns?: VitalSignsDto;

  @IsOptional()
  @IsUUID()
  assignedPhysicianId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isTransferred?: boolean;

  @IsOptional()
  @IsString()
  transferNotes?: string;

  @IsOptional()
  @IsUUID()
  transferredBy?: string;
}
