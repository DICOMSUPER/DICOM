import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDicomStudyDto } from './create-dicom-study.dto';
import { DicomStudyStatus } from '@backend/shared-enums';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateDicomStudyDto extends PartialType(
  OmitType(CreateDicomStudyDto, ['studyStatus'] as const)
) {
  @IsEnum(DicomStudyStatus)
  @IsOptional()
  studyStatus?: DicomStudyStatus;
}
