import { Injectable } from '@nestjs/common';
import { CreatePatientVisitDto } from './dto/create-patient-visit.dto';
import { UpdatePatientVisitDto } from './dto/update-patient-visit.dto';

@Injectable()
export class PatientVisitsService {
  create(createPatientVisitDto: CreatePatientVisitDto) {
    return 'This action adds a new patientVisit';
  }

  findAll() {
    return `This action returns all patientVisits`;
  }

  findOne(id: number) {
    return `This action returns a #${id} patientVisit`;
  }

  update(id: number, updatePatientVisitDto: UpdatePatientVisitDto) {
    return `This action updates a #${id} patientVisit`;
  }

  remove(id: number) {
    return `This action removes a #${id} patientVisit`;
  }
}
