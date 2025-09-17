import { PartialType } from '@nestjs/mapped-types';
import { CreateDicomInstanceDto } from './create-dicom-instance.dto';

export class UpdateDicomInstanceDto extends PartialType(CreateDicomInstanceDto) {}
