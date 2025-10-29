import { PartialType } from '@nestjs/mapped-types';
import { CreateImagingOrderFormDto } from './create-imaging-order-form.dto';

export class UpdateImagingOrderFormDto extends PartialType(CreateImagingOrderFormDto) {}
