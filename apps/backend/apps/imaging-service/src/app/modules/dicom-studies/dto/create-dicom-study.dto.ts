import { IsDate, IsEnum, IsString } from 'class-validator';
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
  performingPhysicianId?: string;

  @IsString()
  technicianId?: string;

  @IsEnum(DicomStudyStatus)
  studyStatus!: DicomStudyStatus;

  @IsString()
  storagePath?: string;
}
