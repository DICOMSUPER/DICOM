import { Injectable } from '@nestjs/common';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';

@Injectable()
export class PatientEncounterService {
  create(createPatientEncounterDto: CreatePatientEncounterDto) {
    return 'This action adds a new patientEncounter';
  }

  findAll() {
    return `This action returns all patientEncounters`;
  }

  findOne(id: number) {
    return `This action returns a #${id} patientEncounter`;
  }

  update(id: number, updatePatientEncounterDto: UpdatePatientEncounterDto) {
    return `This action updates a #${id} patientEncounter`;
  }

  remove(id: number) {
    return `This action removes a #${id} patientEncounter`;
  }
}
