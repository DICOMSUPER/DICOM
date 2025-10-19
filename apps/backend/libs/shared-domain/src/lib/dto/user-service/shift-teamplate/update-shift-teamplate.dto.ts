import { PartialType } from '@nestjs/swagger';
import { CreateShiftTemplateDto } from './create-shift-teamplate.dto';

export class UpdateShiftTemplateDto extends PartialType(CreateShiftTemplateDto) {}