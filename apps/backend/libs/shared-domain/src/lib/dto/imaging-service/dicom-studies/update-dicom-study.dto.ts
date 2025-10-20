import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateDicomStudyDto } from './create-dicom-study.dto';
import { DicomStudyStatus } from '@backend/shared-enums';

export class UpdateDicomStudyDto extends PartialType(CreateDicomStudyDto) {}
