import { PartialType } from '@nestjs/mapped-types';
import { CreateReportTemplateDto } from './create-report-templates.dto';


export class UpdateReportTemplateDto extends PartialType(CreateReportTemplateDto) {}
