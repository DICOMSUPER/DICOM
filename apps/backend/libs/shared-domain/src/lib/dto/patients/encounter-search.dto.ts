import { IsString, IsDate, IsEnum, IsOptional, IsBoolean, IsUUID, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EncounterType } from '@backend/shared-enums';

export class EncounterSearchDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsEnum(EncounterType)
  encounterType?: EncounterType;

  @IsOptional()
  @IsDateString()
  encounterDateFrom?: string;

  @IsOptional()
  @IsDateString()
  encounterDateTo?: string;

  @IsOptional()
  @IsUUID()
  assignedPhysicianId?: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
