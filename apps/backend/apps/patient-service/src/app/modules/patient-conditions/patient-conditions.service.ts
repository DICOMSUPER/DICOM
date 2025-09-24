import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientConditionDto } from './dto/create-patient-condition.dto';
import { UpdatePatientConditionDto } from './dto/update-patient-condition.dto';
import { PatientConditionResponseDto } from './dto/patient-condition-response.dto';
import { PatientRepository } from '@backend/shared-domain';

@Injectable()
export class PatientConditionService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async create(createPatientConditionDto: CreatePatientConditionDto): Promise<PatientConditionResponseDto> {
    // Verify patient exists
    const patient = await this.patientRepository.findById(createPatientConditionDto.patientId);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${createPatientConditionDto.patientId} not found`);
    }

    const condition = await this.patientRepository.createCondition(createPatientConditionDto);
    return this.mapToResponseDto(condition);
  }

  async findAll(): Promise<PatientConditionResponseDto[]> {
    const conditions = await this.patientRepository.findAllConditions();
    return conditions.map(condition => this.mapToResponseDto(condition));
  }

  async findByPatientId(patientId: string): Promise<PatientConditionResponseDto[]> {
    const conditions = await this.patientRepository.findConditionsByPatientId(patientId);
    return conditions.map(condition => this.mapToResponseDto(condition));
  }

  async findOne(id: string): Promise<PatientConditionResponseDto> {
    const condition = await this.patientRepository.findConditionById(id);
    if (!condition) {
      throw new NotFoundException(`Patient condition with ID ${id} not found`);
    }
    return this.mapToResponseDto(condition);
  }

  async update(id: string, updatePatientConditionDto: UpdatePatientConditionDto): Promise<PatientConditionResponseDto> {
    const condition = await this.patientRepository.updateCondition(id, updatePatientConditionDto);
    if (!condition) {
      throw new NotFoundException(`Patient condition with ID ${id} not found`);
    }
    return this.mapToResponseDto(condition);
  }

  async remove(id: string): Promise<void> {
    const result = await this.patientRepository.deleteCondition(id);
    if (!result) {
      throw new NotFoundException(`Patient condition with ID ${id} not found`);
    }
  }

  private mapToResponseDto(condition: any): PatientConditionResponseDto {
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
