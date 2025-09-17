import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientVisitDto } from './create-patient-visit.dto';

export class UpdatePatientVisitDto extends PartialType(CreatePatientVisitDto) {}
