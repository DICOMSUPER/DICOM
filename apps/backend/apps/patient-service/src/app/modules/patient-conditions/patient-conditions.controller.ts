import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PatientConditionService } from './patient-conditions.service';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';

@Controller('patient-conditions')
export class PatientConditionController {
  constructor(private readonly patientConditionService: PatientConditionService) {}

  @Post()
  create(@Body() createPatientConditionDto: CreatePatientConditionDto) {
    return this.patientConditionService.create(createPatientConditionDto);
  }

  @Get()
  findAll() {
    return this.patientConditionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientConditionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientConditionDto: UpdatePatientConditionDto) {
    return this.patientConditionService.update(+id, updatePatientConditionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientConditionService.remove(+id);
  }
}
