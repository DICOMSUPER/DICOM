import { PartialType } from '@nestjs/mapped-types';
import { CreateImageAnnotationDto } from './create-image-annotation.dto';

export class UpdateImageAnnotationDto extends PartialType(CreateImageAnnotationDto) {}
