import { IsString, IsDate, IsEnum, IsOptional, IsBoolean, IsUUID, IsEmail, IsPhoneNumber, MinLength, MaxLength, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Gender, BloodType, EncounterType, DiagnosisType, DiagnosisStatus, Severity } from '@backend/shared-enums';
import type { VitalSignsCollection } from '@backend/shared-interfaces';
import { IsInsuranceNumber } from '@backend/shared-utils';

// Base DTOs
export class CreatePatientDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  patientCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  insuranceNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @IsOptional()
  conditions?: any[];
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @IsOptional()
  @IsInsuranceNumber({ message: 'Insurance number must be exactly 10 digits' })
  @Transform(({ value }) => value?.replace(/\D/g, '')) // Remove non-digits
  insuranceNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PatientSearchDto {
  @IsOptional()
  @IsString()
  patientCode?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

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

// Encounter DTOs
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
  vitalSigns?: VitalSignsCollection;

  @IsOptional()
  @IsUUID()
  assignedPhysicianId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

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

// Diagnosis DTOs
export class CreateDiagnosisReportDto {
  @IsUUID()
  encounterId!: string;

  @IsUUID()
  studyId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  diagnosisName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(DiagnosisType)
  diagnosisType!: DiagnosisType;

  @IsOptional()
  @IsEnum(DiagnosisStatus)
  diagnosisStatus?: DiagnosisStatus = DiagnosisStatus.ACTIVE;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsDateString()
  diagnosisDate!: string;

  @IsUUID()
  diagnosedBy!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  followupRequired?: boolean = false;

  @IsOptional()
  @IsBoolean()
  followUpInstructions?: boolean = false;
}

export class UpdateDiagnosisReportDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  diagnosisName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(DiagnosisType)
  diagnosisType?: DiagnosisType;

  @IsOptional()
  @IsEnum(DiagnosisStatus)
  diagnosisStatus?: DiagnosisStatus;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsDateString()
  diagnosisDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  followupRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  followUpInstructions?: boolean;
}

export class DiagnosisSearchDto {
  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsEnum(DiagnosisType)
  diagnosisType?: DiagnosisType;

  @IsOptional()
  @IsEnum(DiagnosisStatus)
  diagnosisStatus?: DiagnosisStatus;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsUUID()
  diagnosedBy?: string;

  @IsOptional()
  @IsDateString()
  diagnosisDateFrom?: string;

  @IsOptional()
  @IsDateString()
  diagnosisDateTo?: string;

  @IsOptional()
  @IsString()
  diagnosisName?: string;

  @IsOptional()
  @IsBoolean()
  followupRequired?: boolean;

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

// Response DTOs
export class PatientResponseDto {
  id!: string;
  patientCode!: string;
  firstName!: string;
  lastName!: string;
  dateOfBirth!: Date;
  gender!: Gender;
  phoneNumber?: string;
  address?: string;
  bloodType?: BloodType;
  insuranceNumber?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy?: string;
  isDeleted?: boolean;
  encountersCount?: number;
  diagnosesCount?: number;
  lastEncounterDate?: Date;
  encounters?: any[];
  conditions?: any[];
}

export class PatientEncounterResponseDto {
  id!: string;
  patientId!: string;
  encounterDate!: Date;
  encounterType!: EncounterType;
  chiefComplaint?: string;
  symptoms?: string;
  vitalSigns?: VitalSignsCollection;
  assignedPhysicianId?: string;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;
  isDeleted?: boolean;
  patient?: {
    id: string;
    patientCode: string;
    firstName: string;
    lastName: string;
  };
  diagnosesCount?: number;
}

export class DiagnosisReportResponseDto {
  id!: string;
  encounterId!: string;
  studyId!: string;
  diagnosisName!: string;
  description?: string;
  diagnosisType!: DiagnosisType;
  diagnosisStatus!: DiagnosisStatus;
  severity?: Severity;
  diagnosisDate!: Date;
  diagnosedBy!: string;
  notes?: string;
  followupRequired!: boolean;
  followUpInstructions!: boolean;
  isDeleted?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  encounter?: {
    id: string;
    patientId: string;
    encounterDate: Date;
    encounterType: EncounterType;
  };
  patient?: {
    id: string;
    patientCode: string;
    firstName: string;
    lastName: string;
  };
}

// Pagination DTOs
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  data!: T[];
  total!: number;
  page!: number;
  totalPages!: number;
  hasNextPage!: boolean;
  hasPreviousPage!: boolean;
}

// Statistics DTOs
export class PatientStatsDto {
  totalPatients!: number;
  activePatients!: number;
  inactivePatients!: number;
  deletedPatients!: number;
  newPatientsThisMonth!: number;
}

export class EncounterStatsDto {
  totalEncounters!: number;
  encountersByType!: Record<string, number>;
  encountersThisMonth!: number;
  averageEncountersPerPatient!: number;
}

export class DiagnosisStatsDto {
  totalDiagnoses!: number;
  diagnosesByType!: Record<string, number>;
  diagnosesByStatus!: Record<string, number>;
  diagnosesBySeverity!: Record<string, number>;
  diagnosesThisMonth!: number;
  followupRequiredCount!: number;
}
