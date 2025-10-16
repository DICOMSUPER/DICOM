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
import {
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
} from '@backend/shared-domain';
import type { EncounterSearchFilters } from '@backend/shared-domain';

@Controller('encounters')
export class PatientEncounterController {
  private readonly logger = new Logger('PatientEncounterController');

  constructor(
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PatientService')
    private readonly patientService: ClientProxy
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatientEncounterDto: CreatePatientEncounterDto) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientEncounter.Create', {
          createPatientEncounterDto,
        })
      );
    } catch (error) {
      this.logger.error('Error creating encounter:', error);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query() filters: EncounterSearchFilters,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    try {
      // Validate pagination parameters
      const validatedParams = ValidationUtils.validatePaginationParams(
        page,
        limit
      );

      const paginationDto = {
        page: validatedParams.page || 1,
        limit: validatedParams.limit || 10,
        ...filters,
      };
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientEncounter.FindMany', {
          paginationDto,
        })
      );
    } catch (error) {
      this.logger.error('Error fetching encounters:', error);
      throw error;
    }
  }

  @Get('stats')
  async getStats() {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.PatientEncounter.GetStats', {})
      );
    } catch (error) {
      this.logger.error('Error fetching encounter stats:', error);
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
        this.patientService.send('PatientService.PatientEncounter.FindOne', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error fetching encounter:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientEncounterDto: UpdatePatientEncounterDto
  ) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.PatientEncounter.Update', {
          id,
          updatePatientEncounterDto,
        })
      );
    } catch (error) {
      this.logger.error('Error updating encounter:', error);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }

      return await firstValueFrom(
        this.patientService.send('PatientService.PatientEncounter.Delete', {
          id,
        })
      );
    } catch (error) {
      this.logger.error('Error deleting encounter:', error);
      throw error;
    }
  }
}
