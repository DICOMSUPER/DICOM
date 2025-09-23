import { PartialType } from '@nestjs/mapped-types';
import { CreateDicomSeriesDto } from './create-dicom-series.dto';

export class UpdateDicomSeriesDto extends PartialType(CreateDicomSeriesDto) {}
