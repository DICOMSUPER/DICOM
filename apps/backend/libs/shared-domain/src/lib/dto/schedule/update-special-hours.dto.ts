import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecialHoursDto } from './create-special-hours.dto';

export class UpdateSpecialHoursDto extends PartialType(CreateSpecialHoursDto) {}
