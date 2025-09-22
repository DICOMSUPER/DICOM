import { PartialType } from '@nestjs/mapped-types';
import { CreateDicomStudyDto } from './create-dicom-study.dto';

export class UpdateDicomStudyDto extends PartialType(CreateDicomStudyDto) {}
