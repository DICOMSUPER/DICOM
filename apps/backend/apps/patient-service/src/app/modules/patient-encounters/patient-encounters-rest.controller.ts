import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PatientEncounterService } from './patient-encounters.service';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';
import { EncounterSearchFilters, PatientEncounterResponseDto, PaginatedResponseDto } from '@backend/shared-domain';

@Controller('encounters')
export class PatientEncounterRestController {
  constructor(private readonly patientEncounterService: PatientEncounterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatientEncounterDto: CreatePatientEncounterDto): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.create(createPatientEncounterDto);
  }

  @Get()
  async findAll(@Query() filters: EncounterSearchFilters): Promise<PatientEncounterResponseDto[]> {
    return await this.patientEncounterService.findAll(filters);
  }

  @Get('paginated')
  async findWithPagination(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: Omit<EncounterSearchFilters, 'limit' | 'offset'>
  ): Promise<PaginatedResponseDto<PatientEncounterResponseDto>> {
    return await this.patientEncounterService.findWithPagination(page, limit, filters);
  }

  @Get('patient/:patientId')
  async findByPatientId(
    @Param('patientId') patientId: string,
    @Query('limit') limit?: number
  ): Promise<PatientEncounterResponseDto[]> {
    return await this.patientEncounterService.findByPatientId(patientId, limit);
  }

  @Get('physician/:physicianId')
  async findByPhysicianId(
    @Param('physicianId') physicianId: string,
    @Query('limit') limit?: number
  ): Promise<PatientEncounterResponseDto[]> {
    return await this.patientEncounterService.findByPhysicianId(physicianId, limit);
  }

  @Get('stats')
  async getStats(): Promise<any> {
    return await this.patientEncounterService.getEncounterStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientEncounterDto: UpdatePatientEncounterDto
  ): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.update(id, updatePatientEncounterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return await this.patientEncounterService.remove(id);
  }
}
