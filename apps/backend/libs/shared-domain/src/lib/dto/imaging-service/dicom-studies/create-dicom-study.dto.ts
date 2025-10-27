import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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

  @IsUUID()
  modalityMachineId!: string;

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
  studyStatus?: DicomStudyStatus = DicomStudyStatus.WAITING_TO_SCAN;

  @IsString()
  @IsOptional()
  storagePath?: string;
}
