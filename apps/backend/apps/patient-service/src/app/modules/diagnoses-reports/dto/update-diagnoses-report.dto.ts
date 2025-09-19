import { PartialType } from '@nestjs/mapped-types';
import { CreateDiagnosesReportDto } from './create-diagnoses-report.dto';

export class UpdateDiagnosesReportDto extends PartialType(CreateDiagnosesReportDto) {}
