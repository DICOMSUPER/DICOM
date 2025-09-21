import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('patient-conditions')
export class PatientConditionController {
  private readonly logger = new Logger('PatientConditionController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PatientService') 
    private readonly patientService: ClientProxy
  ) {}

  @Post()
  async create(@Body() createPatientConditionDto: any) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.Create', createPatientConditionDto)
      );
    } catch (error) {
      this.logger.error('Error creating patient condition:', error);
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.FindAll', {})
      );
    } catch (error) {
      this.logger.error('Error finding all patient conditions:', error);
      throw error;
    }
  }

  @Get('patient/:patientId')
  async findByPatientId(@Param('patientId') patientId: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.FindByPatientId', { patientId })
      );
    } catch (error) {
      this.logger.error('Error finding patient conditions by patient ID:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.FindOne', { id })
      );
    } catch (error) {
      this.logger.error('Error finding patient condition by ID:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePatientConditionDto: any) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.Update', { 
          id, 
          updatePatientConditionDto 
        })
      );
    } catch (error) {
      this.logger.error('Error updating patient condition:', error);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.Delete', { id })
      );
    } catch (error) {
      this.logger.error('Error deleting patient condition:', error);
      throw error;
    }
  }
}
