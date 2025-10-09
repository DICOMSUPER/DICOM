import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePatientEncounterDto } from './dto/create-patient-encounter.dto';
import { UpdatePatientEncounterDto } from './dto/update-patient-encounter.dto';
import { PatientEncounterRepository, EncounterWithDetails } from '@backend/shared-domain';
import { PatientEncounterResponseDto, PaginatedResponseDto } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';
import { IPatientEncounter, IEncounterWithDetails } from '@backend/shared-interfaces';
import { ValidationUtils } from '@backend/shared-utils';

@Injectable()
export class PatientEncounterService {
  constructor(private readonly encounterRepository: PatientEncounterRepository) {}

  async create(createPatientEncounterDto: CreatePatientEncounterDto): Promise<PatientEncounterResponseDto> {
    try {
      const encounter = await this.encounterRepository.create(createPatientEncounterDto);
      return this.mapToResponseDto(encounter);
    } catch (error) {
      throw new BadRequestException('Failed to create patient encounter');
    }
  }

  async findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<PatientEncounterResponseDto>> {
    try {
      const result = await this.encounterRepository.findWithPagination(paginationDto);
      return {
        data: result.encounters.map((encounter: IPatientEncounter) => this.mapToResponseDto(encounter)),
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch patient encounters');
    }
  }


  async findOne(id: string): Promise<PatientEncounterResponseDto> {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      const encounter = await this.encounterRepository.findByIdWithRelations(id);
      if (!encounter) {
        throw new NotFoundException(`Encounter with ID ${id} not found`);
      }
      return this.mapToResponseDto(encounter);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Handle database errors
      if (error instanceof Error && error.message?.includes('invalid input syntax for type uuid')) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      throw error;
    }
  }

  async update(id: string, updatePatientEncounterDto: UpdatePatientEncounterDto): Promise<PatientEncounterResponseDto> {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      const encounter = await this.encounterRepository.update(id, updatePatientEncounterDto);
      if (!encounter) {
        throw new NotFoundException(`Encounter with ID ${id} not found`);
      }
      return this.mapToResponseDto(encounter);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Handle database errors
      if (error instanceof Error && error.message?.includes('invalid input syntax for type uuid')) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      const result = await this.encounterRepository.softDeleteEncounter(id);
      if (!result) {
        throw new NotFoundException(`Encounter with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Handle database errors
      if (error instanceof Error && error.message?.includes('invalid input syntax for type uuid')) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      throw error;
    }
  }

  async getEncounterStats(): Promise<any> {
    return await this.encounterRepository.getEncounterStats();
  }


  private mapToResponseDto(encounter: IPatientEncounter | IEncounterWithDetails | EncounterWithDetails): PatientEncounterResponseDto {
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
      diagnosesCount: (encounter as any).diagnosesCount || 0,
    };
  }
}
