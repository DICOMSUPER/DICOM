import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreatePatientConditionDto,
  UpdatePatientConditionDto,
} from '@backend/shared-domain';
import {
  PatientConditionRepository,
  PatientCondition,
} from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';

@Injectable()
export class PatientConditionService {
  constructor(
    @Inject(PatientConditionRepository)
    private readonly patientConditionRepository: PatientConditionRepository
  ) {}

  private checkPatientCondition = async (
    id: string
  ): Promise<PatientCondition> => {
    const condition = await this.patientConditionRepository.findById(id);
    if (!condition) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Patient condition not found',
        PATIENT_SERVICE
      );
    }
    return condition;
  };

  create = async (
    createPatientConditionDto: CreatePatientConditionDto
  ): Promise<PatientCondition> => {
    return await this.patientConditionRepository.create(
      createPatientConditionDto
    );
  };

  findAll = async (): Promise<PatientCondition[]> => {
    return await this.patientConditionRepository.findAll({ where: {} });
  };

  findOne = async (id: string): Promise<PatientCondition | null> => {
    const condition = await this.patientConditionRepository.findById(id);
    if (!condition) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find patient condition',
        PATIENT_SERVICE
      );
    }
    return condition;
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<PatientCondition>> => {
    return await this.patientConditionRepository.paginate(paginationDto);
  };

  update = async (
    id: string,
    updatePatientConditionDto: UpdatePatientConditionDto
  ): Promise<PatientCondition | null> => {
    const condition = await this.checkPatientCondition(id);
    return await this.patientConditionRepository.update(
      id,
      updatePatientConditionDto
    );
  };

  remove = async (id: string): Promise<boolean> => {
    await this.checkPatientCondition(id);
    return await this.patientConditionRepository.softDelete(id, 'isDeleted');
  };

  findByPatientId = async (
    patientId: string,
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<PatientCondition>> => {
    return await this.patientConditionRepository.paginate(paginationDto, {
      where: { patientId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  };
}
