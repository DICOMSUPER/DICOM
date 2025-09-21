import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PatientEncounterService } from '../services/patient-encounter.service';
import { CreateEncounterDto, UpdateEncounterDto } from '../dtos/encounter.dto';
import { PatientEncounter } from '../entities/patient-encounter.entity';

@Controller('patient-encounters')
export class PatientEncounterController {
  constructor(private readonly encounterService: PatientEncounterService) {}

  @Post()
  create(@Body() createEncounterDto: CreateEncounterDto): Promise<PatientEncounter> {
    return this.encounterService.create(createEncounterDto);
  }

  @Get()
  findAll(@Query('patientId') patientId?: string): Promise<PatientEncounter[]> {
    if (patientId) {
      return this.encounterService.findByPatient(patientId);
    }
    return this.encounterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PatientEncounter> {
    return this.encounterService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEncounterDto: UpdateEncounterDto,
  ): Promise<PatientEncounter> {
    return this.encounterService.update(id, updateEncounterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.encounterService.remove(id);
  }
}