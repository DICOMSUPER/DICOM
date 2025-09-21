import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PatientEncounterService } from './patient-encounters.service';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';

@Controller('patient-encounters')
export class PatientEncounterController {
  constructor(private readonly patientEncounterService: PatientEncounterService) {}

  @Post()
  create(@Body() createPatientEncounterDto: CreatePatientEncounterDto) {
    return this.patientEncounterService.create(createPatientEncounterDto);
  }

  @Get()
  findAll() {
    return this.patientEncounterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientEncounterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientEncounterDto: UpdatePatientEncounterDto) {
    return this.patientEncounterService.update(+id, updatePatientEncounterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientEncounterService.remove(+id);
  }
}
