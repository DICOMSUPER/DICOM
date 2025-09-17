import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PatientVisitsService } from './patient-visits.service';
import { CreatePatientVisitDto } from './dto/create-patient-visit.dto';
import { UpdatePatientVisitDto } from './dto/update-patient-visit.dto';

@Controller('patient-visits')
export class PatientVisitsController {
  constructor(private readonly patientVisitsService: PatientVisitsService) {}

  @Post()
  create(@Body() createPatientVisitDto: CreatePatientVisitDto) {
    return this.patientVisitsService.create(createPatientVisitDto);
  }

  @Get()
  findAll() {
    return this.patientVisitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientVisitsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientVisitDto: UpdatePatientVisitDto) {
    return this.patientVisitsService.update(+id, updatePatientVisitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientVisitsService.remove(+id);
  }
}
