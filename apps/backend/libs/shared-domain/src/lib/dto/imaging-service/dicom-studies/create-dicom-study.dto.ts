import {
  IsDate,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DicomStudyStatus } from '@backend/shared-enums';
import { Type } from 'class-transformer';

export class CreateDicomStudyDto {
  @IsString()
  studyInstanceUid!: string;

  @IsString()
  patientId!: string;

  @IsString()
  orderId!: string;

  @IsString()
  @IsOptional()
  modalityId?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  studyDate?: Date = new Date();

  @IsUUID()
  modalityMachineId!: string;

  @IsString()
  studyTime!: string;

  @IsString()
  studyDescription?: string;

  @IsString()
  referringPhysician?: string;

  @IsString()
  reason?: string;

  @IsString()
  performingTechnicianId?: string;

  @IsString()
  @IsOptional()
  verifyingRadiologistId?: string;

  @IsEnum(DicomStudyStatus)
  studyStatus?: DicomStudyStatus = DicomStudyStatus.SCANNED;

  @IsString()
  @IsOptional()
  storagePath?: string;
}
