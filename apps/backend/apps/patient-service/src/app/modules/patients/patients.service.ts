import { Injectable, NotFoundException } from '@nestjs/common';
import { 
  CreatePatientDto, 
  UpdatePatientDto, 
  PatientSearchDto, 
  PatientResponseDto,
  PaginatedResponseDto,
  PatientStatsDto,
  PatientRepository
} from '@backend/shared-domain';

@Injectable()
export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
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
  }

  async findAll(searchDto: PatientSearchDto = {}): Promise<PatientResponseDto[]> {
    const patients = await this.patientRepository.findAll(searchDto);
    return patients.map(patient => this.mapToResponseDto(patient));
  }

  async findPatientsWithPagination(
    page: number, 
    limit: number, 
    searchDto: Omit<PatientSearchDto, 'limit' | 'offset'> = {}
  ): Promise<PaginatedResponseDto<PatientResponseDto>> {
    const result = await this.patientRepository.findWithPagination(page, limit, searchDto);
    return {
      data: result.patients.map((patient: any) => this.mapToResponseDto(patient)),
      total: result.total,
      page: result.page,
      limit: limit,
      totalPages: result.totalPages
    };
  }

  async searchPatientsByName(searchTerm: string, limit: number = 10): Promise<PatientResponseDto[]> {
    const patients = await this.patientRepository.searchByName(searchTerm, limit);
    return patients.map((patient: any) => this.mapToResponseDto(patient));
  }

  async getPatientStats(): Promise<PatientStatsDto> {
    return await this.patientRepository.getPatientStats();
  }

  async findPatientByCode(patientCode: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findByPatientCode(patientCode);
    if (!patient) {
      throw new NotFoundException(`Patient with code ${patientCode} not found`);
    }
    return this.mapToResponseDto(patient);
  }

  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return this.mapToResponseDto(patient);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<PatientResponseDto> {
    const { conditions, ...patientData } = updatePatientDto;
    
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
        const conditionPromises = conditions.map(condition => 
          this.patientRepository.createCondition({
            ...condition,
            patientId: id
          })
        );
        await Promise.all(conditionPromises);
      }
    }
    
    return this.mapToResponseDto(patient);
  }

  async remove(id: string): Promise<void> {
    const result = await this.patientRepository.softDelete(id);
    if (!result) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }

  async restore(id: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.restore(id);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return this.mapToResponseDto(patient);
  }

  private mapToResponseDto(patient: any): PatientResponseDto {
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
