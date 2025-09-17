import { PartialType } from '@nestjs/mapped-types';
import { CreateImagingModalityDto } from './create-imaging-modality.dto';

export class UpdateImagingModalityDto extends PartialType(CreateImagingModalityDto) {}
