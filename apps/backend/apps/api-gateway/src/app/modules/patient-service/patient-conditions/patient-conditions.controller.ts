import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller('patient-conditions')
export class PatientConditionController {
  constructor(
    @Inject('PATIENT_SERVICE') private readonly patientService: ClientProxy
  ) {}

  @Post()
  async create(@Body() createPatientConditionDto: any) {
    return this.patientService.send('patient-condition.create', createPatientConditionDto).toPromise();
  }

  @Get()
  async findAll() {
    return this.patientService.send('patient-condition.findAll', {}).toPromise();
  }

  @Get('patient/:patientId')
  async findByPatientId(@Param('patientId') patientId: string) {
    return this.patientService.send('patient-condition.findByPatientId', patientId).toPromise();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientService.send('patient-condition.findOne', id).toPromise();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePatientConditionDto: any) {
    return this.patientService.send('patient-condition.update', { id, updatePatientConditionDto }).toPromise();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientService.send('patient-condition.remove', id).toPromise();
  }
}
