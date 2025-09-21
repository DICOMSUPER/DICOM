import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientEncounterDto } from './create-patient-encounter.dto';

export class UpdatePatientEncounterDto extends PartialType(CreatePatientEncounterDto) {}
