import { PartialType } from '@nestjs/mapped-types';
import { CreateBreakTimeDto } from './create-break-time.dto';

export class UpdateBreakTimeDto extends PartialType(CreateBreakTimeDto) {}
