import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Logger, Query, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ValidationUtils } from '@backend/shared-utils';

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
  async findAll(
    @Query() searchDto: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    try {
      // Validate pagination parameters
      const validatedParams = ValidationUtils.validatePaginationParams(page, limit);
      
      const paginationDto = {
        ...validatedParams,
        ...searchDto
      };
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.FindMany', { paginationDto })
      );
    } catch (error) {
      this.logger.error('Error finding all patient conditions:', error);
      throw error;
    }
  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
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
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
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
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientCondition.Delete', { id })
      );
    } catch (error) {
      this.logger.error('Error deleting patient condition:', error);
      throw error;
    }
  }
}
