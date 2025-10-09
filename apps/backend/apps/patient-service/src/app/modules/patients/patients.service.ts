import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  CreatePatientDto, 
  UpdatePatientDto, 
  PatientResponseDto,
  PaginatedResponseDto,
  PatientStatsDto,
  PatientRepository
} from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';
import { IPatient, IPatientWithRelations } from '@backend/shared-interfaces';
import { ValidationUtils } from '@backend/shared-utils';

@Injectable()
export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    try {
      const { conditions, ...patientData } = createPatientDto;
      
      // Create the patient first
      const patient = await this.patientRepository.create(patientData);
      
      // Create conditions if provided
      if (conditions && conditions.length > 0) {
        const conditionPromises = conditions.map(condition => 
          this.patientRepository.createCondition({
            ...condition,
            patientId: patient.id
          })
        );
        await Promise.all(conditionPromises);
      }
      
      return this.mapToResponseDto(patient);
    } catch (error) {
      throw new BadRequestException('Failed to create patient');
    }
  }

  async findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<PatientResponseDto>> {
    try {
      const result = await this.patientRepository.findWithPagination(paginationDto);
      return {
        data: result.patients.map((patient: IPatient) => this.mapToResponseDto(patient)),
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch patients');
    }
  }


  async getPatientStats(): Promise<PatientStatsDto> {
    try {
      return await this.patientRepository.getPatientStats();
    } catch (error) {
      throw new BadRequestException('Failed to fetch patient statistics');
    }
  }

  async findPatientByCode(patientCode: string): Promise<PatientResponseDto> {
    try {
      // Validate patient code
      if (!patientCode || patientCode.trim().length === 0) {
        throw new BadRequestException('Patient code is required');
      }
      
      const patient = await this.patientRepository.findByPatientCode(patientCode);
      if (!patient) {
        throw new NotFoundException(`Patient with code ${patientCode} not found`);
      }
      return this.mapToResponseDto(patient);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      const patient = await this.patientRepository.findByIdWithRelations(id);
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }
      return this.mapToResponseDto(patient);
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

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<PatientResponseDto> {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      const { conditions, ...patientData } = updatePatientDto as any;
      
      // Update the patient
      const patient = await this.patientRepository.update(id, patientData);
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }
    
    // Update conditions if provided
    if (conditions !== undefined) {
      // Delete existing conditions
      const existingConditions = await this.patientRepository.findConditionsByPatientId(id);
      const deletePromises = existingConditions.map(condition => 
        this.patientRepository.deleteCondition(condition.id)
      );
      await Promise.all(deletePromises);
      
      // Create new conditions
      if (conditions.length > 0) {
        const conditionPromises = conditions.map((condition: any) => 
          this.patientRepository.createCondition({
            ...condition,
            patientId: id
          })
        );
        await Promise.all(conditionPromises);
      }
    }
    
    return this.mapToResponseDto(patient);
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
      
      const result = await this.patientRepository.softDeletePatient(id);
      if (!result) {
        throw new NotFoundException(`Patient with ID ${id} not found`);
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

  async restore(id: string): Promise<PatientResponseDto> {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      const result = await this.patientRepository.restorePatient(id);
      if (!result) {
        throw new NotFoundException(`Patient with ID ${id} not found`);
      }
      // Get the restored patient to return
      const patient = await this.patientRepository.findByIdWithRelations(id);
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${id} not found after restore`);
      }
      return this.mapToResponseDto(patient);
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


  private mapToResponseDto(patient: IPatient | IPatientWithRelations): PatientResponseDto {
    return {
      id: patient.id,
      patientCode: patient.patientCode,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phoneNumber: patient.phoneNumber,
      address: patient.address,
      bloodType: patient.bloodType,
      insuranceNumber: patient.insuranceNumber,
      isActive: patient.isActive,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      encounters: patient.encounters || [],
      conditions: patient.conditions || []
    };
  }
}
