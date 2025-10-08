import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';
import { PatientEncounterRepository, EncounterSearchFilters, EncounterWithDetails } from '@backend/shared-domain';
import { PatientEncounterResponseDto, PaginatedResponseDto } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';

@Injectable()
export class PatientEncounterService {
  constructor(private readonly encounterRepository: PatientEncounterRepository) {}

  async create(createPatientEncounterDto: CreatePatientEncounterDto): Promise<PatientEncounterResponseDto> {
    const encounter = await this.encounterRepository.create(createPatientEncounterDto);
    return this.mapToResponseDto(encounter);
  }

  async findAll(filters: EncounterSearchFilters = {}): Promise<PatientEncounterResponseDto[]> {
    const encounters = await this.encounterRepository.findAllWithFilters(filters);
    return encounters.map(encounter => this.mapToResponseDto(encounter));
  }

  async findWithPagination(
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<PatientEncounterResponseDto>> {
    const result = await this.encounterRepository.findWithPagination(paginationDto);
    return {
      data: result.encounters.map(encounter => this.mapToResponseDto(encounter)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.page < result.totalPages,
      hasPreviousPage: result.page > 1
    };
  }

  async findByPatientId(patientId: string, limit?: number): Promise<PatientEncounterResponseDto[]> {
    const encounters = await this.encounterRepository.findByPatientId(patientId, limit);
    return encounters.map(encounter => this.mapToResponseDto(encounter));
  }

  async findByPhysicianId(physicianId: string, limit?: number): Promise<PatientEncounterResponseDto[]> {
    const encounters = await this.encounterRepository.findByPhysicianId(physicianId, limit);
    return encounters.map(encounter => this.mapToResponseDto(encounter));
  }

  async findOne(id: string): Promise<PatientEncounterResponseDto> {
    const encounter = await this.encounterRepository.findByIdWithRelations(id);
    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }
    return this.mapToResponseDto(encounter);
  }

  async update(id: string, updatePatientEncounterDto: UpdatePatientEncounterDto): Promise<PatientEncounterResponseDto> {
    const encounter = await this.encounterRepository.update(id, updatePatientEncounterDto);
    if (!encounter) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }
    return this.mapToResponseDto(encounter);
  }

  async remove(id: string): Promise<void> {
    const result = await this.encounterRepository.softDeleteEncounter(id);
    if (!result) {
      throw new NotFoundException(`Encounter with ID ${id} not found`);
    }
  }

  async getEncounterStats(): Promise<any> {
    return await this.encounterRepository.getEncounterStats();
  }

  private mapToResponseDto(encounter: EncounterWithDetails): PatientEncounterResponseDto {
    return {
      id: encounter.id,
      patientId: encounter.patientId,
      encounterDate: encounter.encounterDate,
      encounterType: encounter.encounterType,
      chiefComplaint: encounter.chiefComplaint,
      symptoms: encounter.symptoms,
      vitalSigns: encounter.vitalSigns,
      assignedPhysicianId: encounter.assignedPhysicianId,
      notes: encounter.notes,
      createdAt: encounter.createdAt,
      updatedAt: encounter.updatedAt,
      isDeleted: encounter.isDeleted,
      patient: encounter.patient ? {
        id: encounter.patient.id,
        patientCode: encounter.patient.patientCode,
        firstName: encounter.patient.firstName,
        lastName: encounter.patient.lastName,
      } : undefined,
      diagnosesCount: encounter.diagnosesCount || 0,
    };
  }
}
