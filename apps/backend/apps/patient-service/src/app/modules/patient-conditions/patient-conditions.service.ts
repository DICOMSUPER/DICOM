import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';
import { PatientConditionResponseDto } from './dto/patient-condition-response.dto';
import { PatientConditionRepository, PaginatedResponseDto } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';
import { IPatientCondition, IConditionWithDetails } from '@backend/shared-interfaces';
import { ValidationUtils } from '@backend/shared-utils';

@Injectable()
export class PatientConditionService {
  constructor(private readonly patientConditionRepository: PatientConditionRepository) {}

  async create(createPatientConditionDto: CreatePatientConditionDto): Promise<PatientConditionResponseDto> {
    try {
      const condition = await this.patientConditionRepository.create(createPatientConditionDto);
      return this.mapToResponseDto(condition);
    } catch (error) {
      throw new BadRequestException('Failed to create patient condition');
    }
  }

  async findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<PatientConditionResponseDto>> {
    try {
      const result = await this.patientConditionRepository.findWithPagination(paginationDto);
      return {
        data: result.conditions.map((condition: IPatientCondition) => this.mapToResponseDto(condition)),
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch patient conditions');
    }
  }


  async findOne(id: string): Promise<PatientConditionResponseDto> {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      const condition = await this.patientConditionRepository.findByIdWithRelations(id);
      if (!condition) {
        throw new NotFoundException(`Patient condition with ID ${id} not found`);
      }
      return this.mapToResponseDto(condition);
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

  async update(id: string, updatePatientConditionDto: UpdatePatientConditionDto): Promise<PatientConditionResponseDto> {
    try {
      // Validate UUID format
      if (!ValidationUtils.isValidUUID(id)) {
        throw new BadRequestException(`Invalid UUID format: ${id}`);
      }
      
      const condition = await this.patientConditionRepository.update(id, updatePatientConditionDto);
      if (!condition) {
        throw new NotFoundException(`Patient condition with ID ${id} not found`);
      }
      return this.mapToResponseDto(condition);
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
      
      const result = await this.patientConditionRepository.softDelete(id, 'isDeleted');
      if (!result) {
        throw new NotFoundException(`Patient condition with ID ${id} not found`);
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


  private mapToResponseDto(condition: IPatientCondition | IConditionWithDetails): PatientConditionResponseDto {
    return {
      id: condition.id,
      patientId: condition.patientId,
      code: condition.code,
      codeSystem: condition.codeSystem,
      codeDisplay: condition.codeDisplay,
      clinicalStatus: condition.clinicalStatus,
      verificationStatus: condition.verificationStatus,
      severity: condition.severity,
      stageSummary: condition.stageSummary,
      bodySite: condition.bodySite,
      recordedDate: condition.recordedDate,
      notes: condition.notes,
      createdAt: condition.createdAt,
      updatedAt: condition.updatedAt,
    };
  }
}
