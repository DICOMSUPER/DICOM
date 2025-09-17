import { Injectable } from '@nestjs/common';
import { CreateEmployeeScheduleDto } from './dto/create-employee-schedule.dto';
import { UpdateEmployeeScheduleDto } from './dto/update-employee-schedule.dto';

@Injectable()
export class EmployeeSchedulesService {
  create(createEmployeeScheduleDto: CreateEmployeeScheduleDto) {
    return 'This action adds a new employeeSchedule';
  }

  findAll() {
    return `This action returns all employeeSchedules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employeeSchedule`;
  }

  update(id: number, updateEmployeeScheduleDto: UpdateEmployeeScheduleDto) {
    return `This action updates a #${id} employeeSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} employeeSchedule`;
  }
}
