import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ValidationUtils } from '@backend/shared-utils';
import { Role } from '@backend/shared-decorators';
import { Roles as RoleEnum } from '@backend/shared-enums';

@Controller('patients')
export class PatientServiceController {
  private readonly logger = new Logger('PatientServiceController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PatientService')
    private readonly patientService: ClientProxy
  ) {}

  @Post()
  @Role(RoleEnum.RECEPTION_STAFF, RoleEnum.PHYSICIAN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatientDto: any) {
    try {
      return await firstValueFrom(
        this.patientService.send(
          'PatientService.Patient.Create',
          createPatientDto
        )
      );
    } catch (error) {
      this.logger.error('Error creating patient:', error);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query() searchDto: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') searchTerm?: string
  ) {
    try {
      // Validate pagination parameters
      const validatedParams = ValidationUtils.validatePaginationParams(
        page,
        limit
      );

      // Validate search term if provided
      if (
        searchTerm !== undefined &&
        (!searchTerm || searchTerm.trim().length === 0)
      ) {
        throw new BadRequestException('Search term cannot be empty');
      }

      const paginationDto = {
        ...validatedParams,
        search: searchTerm,
        ...searchDto,
      };
      return await firstValueFrom(
        this.patientService.send('PatientService.Patient.FindMany', {
          paginationDto,
        })
      );
    } catch (error) {
      this.logger.error('Error finding all patients:', error);
      throw error;
    }
  }

  @Get('stats')
  async getPatientStats() {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Patient.GetStats', {})
      );
    } catch (error) {
      this.logger.error('Error getting patient stats:', error);
      throw error;
    }
  }

  @Get('code/:patientCode')
  async findPatientByCode(@Param('patientCode') patientCode: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Patient.FindByCode', {
          patientCode,
        })
      );
    } catch (error) {
      this.logger.error('Error finding patient by code:', error);
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
        this.patientService.send('PatientService.Patient.FindOne', { id })
      );
    } catch (error) {
      this.logger.error('Error finding patient by ID:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePatientDto: any) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.Patient.Update', {
          id,
          updatePatientDto,
        })
      );
    } catch (error) {
      this.logger.error('Error updating patient:', error);
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
        this.patientService.send('PatientService.Patient.Delete', { id })
      );
    } catch (error) {
      this.logger.error('Error deleting patient:', error);
      throw error;
    }
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.Patient.Restore', { id })
      );
    } catch (error) {
      this.logger.error('Error restoring patient:', error);
      throw error;
    }
  }
}
