import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller('patients')
export class PatientServiceController {
  constructor(
    @Inject('PATIENT_SERVICE') private readonly patientService: ClientProxy
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatientDto: any) {
    return this.patientService.send('patient.create', createPatientDto).toPromise();
  }

  @Get()
  async findAll(@Query() searchDto: any) {
    return this.patientService.send('patient.findAll', searchDto).toPromise();
  }

  @Get('paginated')
  async findPatientsWithPagination(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() searchDto: any
  ) {
    return this.patientService.send('patient.findPatientsWithPagination', { page, limit, searchDto }).toPromise();
  }

  @Get('search')
  async searchPatientsByName(
    @Query('q') searchTerm: string,
    @Query('limit') limit: number
  ) {
    return this.patientService.send('patient.searchPatientsByName', { searchTerm, limit }).toPromise();
  }

  @Get('stats')
  async getPatientStats() {
    return this.patientService.send('patient.getPatientStats', {}).toPromise();
  }

  @Get('code/:patientCode')
  async findPatientByCode(@Param('patientCode') patientCode: string) {
    return this.patientService.send('patient.findPatientByCode', patientCode).toPromise();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientService.send('patient.findOne', id).toPromise();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePatientDto: any) {
    return this.patientService.send('patient.update', { id, updatePatientDto }).toPromise();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patientService.send('patient.remove', id).toPromise();
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    return this.patientService.send('patient.restore', id).toPromise();
  }
}
