import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreatePatientEncounterDto, UpdatePatientEncounterDto } from '@backend/shared-domain';
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
        this.patientService.send('PatientService.Encounter.Create', createPatientEncounterDto)
      );
    } catch (error) {
      this.logger.error('Error creating encounter:', error);
      throw error;
    }
  }

  @Get()
  async findAll(@Query() filters: EncounterSearchFilters) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindAll', filters)
      );
    } catch (error) {
      this.logger.error('Error fetching encounters:', error);
      throw error;
    }
  }

  @Get('paginated')
  async findWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: Omit<EncounterSearchFilters, 'limit' | 'offset'>
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindMany', {
          paginationDto: { page, limit, ...filters }
        })
      );
    } catch (error) {
      this.logger.error('Error fetching paginated encounters:', error);
      throw error;
    }
  }

  @Get('patient/:patientId')
  async findByPatientId(
    @Param('patientId') patientId: string,
    @Query('limit') limit?: number
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindByPatientId', { patientId, limit })
      );
    } catch (error) {
      this.logger.error('Error fetching patient encounters:', error);
      throw error;
    }
  }

  @Get('physician/:physicianId')
  async findByPhysicianId(
    @Param('physicianId') physicianId: string,
    @Query('limit') limit?: number
  ) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindByPhysicianId', { physicianId, limit })
      );
    } catch (error) {
      this.logger.error('Error fetching physician encounters:', error);
      throw error;
    }
  }

  @Get('stats')
  async getStats() {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.GetStats', {})
      );
    } catch (error) {
      this.logger.error('Error fetching encounter stats:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.FindOne', { id })
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
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Update', { id, updatePatientEncounterDto })
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
      return await firstValueFrom(
        this.patientService.send('PatientService.Encounter.Delete', { id })
      );
    } catch (error) {
      this.logger.error('Error deleting encounter:', error);
      throw error;
    }
  }
}
