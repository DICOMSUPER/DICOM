import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PatientEncounterService } from './patient-encounters.service';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';
import { EncounterSearchFilters, PatientEncounterResponseDto, PaginatedResponseDto } from '@backend/shared-domain';

@Controller()
export class PatientEncounterController {
  private readonly logger = new Logger('PatientEncounterController');

  constructor(private readonly patientEncounterService: PatientEncounterService) {}

  // Microservice Message Patterns
  @MessagePattern('PatientService.Encounter.Create')
  async create(createPatientEncounterDto: CreatePatientEncounterDto): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.create(createPatientEncounterDto);
  }

  @MessagePattern('PatientService.Encounter.FindAll')
  async findAll(filters: EncounterSearchFilters): Promise<PatientEncounterResponseDto[]> {
    return await this.patientEncounterService.findAll(filters);
  }

  @MessagePattern('PatientService.Encounter.FindMany')
  async findWithPagination(data: { paginationDto: { page?: number; limit?: number; [key: string]: any } }): Promise<PaginatedResponseDto<PatientEncounterResponseDto>> {
    const { page = 1, limit = 10, ...filters } = data.paginationDto;
    return await this.patientEncounterService.findWithPagination(page, limit, filters);
  }

  @MessagePattern('PatientService.Encounter.FindByPatientId')
  async findByPatientId(data: { patientId: string; limit?: number }): Promise<PatientEncounterResponseDto[]> {
    return await this.patientEncounterService.findByPatientId(data.patientId, data.limit);
  }

  @MessagePattern('PatientService.Encounter.FindByPhysicianId')
  async findByPhysicianId(data: { physicianId: string; limit?: number }): Promise<PatientEncounterResponseDto[]> {
    return await this.patientEncounterService.findByPhysicianId(data.physicianId, data.limit);
  }

  @MessagePattern('PatientService.Encounter.FindOne')
  async findOne(data: { id: string }): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.findOne(data.id);
  }

  @MessagePattern('PatientService.Encounter.Update')
  async update(data: { id: string; updatePatientEncounterDto: UpdatePatientEncounterDto }): Promise<PatientEncounterResponseDto> {
    return await this.patientEncounterService.update(data.id, data.updatePatientEncounterDto);
  }

  @MessagePattern('PatientService.Encounter.Delete')
  async remove(data: { id: string }): Promise<void> {
    return await this.patientEncounterService.remove(data.id);
  }

  @MessagePattern('PatientService.Encounter.GetStats')
  async getEncounterStats(): Promise<any> {
    return await this.patientEncounterService.getEncounterStats();
  }

}
