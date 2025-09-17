import { PartialType } from '@nestjs/mapped-types';
import { CreateDicomSeryDto } from './create-dicom-sery.dto';

export class UpdateDicomSeryDto extends PartialType(CreateDicomSeryDto) {}
