import { Injectable } from '@nestjs/common';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';

@Injectable()
export class PatientConditionService {
  create(createPatientConditionDto: CreatePatientConditionDto) {
    return 'This action adds a new patientCondition';
  }

  findAll() {
    return `This action returns all patientCondition`;
  }

  findOne(id: number) {
    return `This action returns a #${id} patientCondition`;
  }

  update(id: number, updatePatientConditionDto: UpdatePatientConditionDto) {
    return `This action updates a #${id} patientCondition`;
  }

  remove(id: number) {
    return `This action removes a #${id} patientCondition`;
  }
}
