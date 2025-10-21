import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { DicomStudyStatus } from '@backend/shared-enums';

export class CreateDicomStudyDto {
  @IsString()
  studyInstanceUid!: string;

  @IsString()
  patientId!: string;

  @IsString()
  orderId!: string;

  @IsString()
  modalityId!: string;

  @IsDate()
  studyDate!: Date;

  @IsString()
  studyTime!: string;

  @IsString()
  studyDescription?: string;

  @IsString()
  referringPhysician?: string;

  @IsString()
  performingTechnicianId?: string;

  @IsString()
  @IsOptional()
  verifyingRadiologistId?: string;

  @IsEnum(DicomStudyStatus)
  studyStatus?: DicomStudyStatus = DicomStudyStatus.IN_PROGRESS;

  @IsString()
  @IsOptional()
  storagePath?: string;
}
