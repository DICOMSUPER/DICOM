import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeeSchedulesService } from './employee-schedules.service';
import { CreateEmployeeScheduleDto } from './dto/create-employee-schedule.dto';
import { UpdateEmployeeScheduleDto } from './dto/update-employee-schedule.dto';

@Controller('employee-schedules')
export class EmployeeSchedulesController {
  constructor(private readonly employeeSchedulesService: EmployeeSchedulesService) {}

  @Post()
  create(@Body() createEmployeeScheduleDto: CreateEmployeeScheduleDto) {
    return this.employeeSchedulesService.create(createEmployeeScheduleDto);
  }

  @Get()
  findAll() {
    return this.employeeSchedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeSchedulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeScheduleDto: UpdateEmployeeScheduleDto) {
    return this.employeeSchedulesService.update(+id, updateEmployeeScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeSchedulesService.remove(+id);
  }
}
