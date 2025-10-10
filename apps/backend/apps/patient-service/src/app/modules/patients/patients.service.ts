import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { 
  CreatePatientDto, 
  UpdatePatientDto, 
  Patient,
  PatientStatsDto,
  PatientRepository
} from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';

@Injectable()
export class PatientService {
  constructor(
    @Inject() private readonly patientRepository: PatientRepository
  ) {}

  private checkPatient = async (id: string): Promise<Patient> => {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Patient not found',
        PATIENT_SERVICE
      );
    }
    return patient;
  };

  create = async (
    createPatientDto: CreatePatientDto
  ): Promise<Patient> => {
    return await this.patientRepository.create(createPatientDto);
  };

  findAll = async (): Promise<Patient[]> => {
    return await this.patientRepository.findAll({ where: {} });
  };

  findOne = async (id: string): Promise<Patient | null> => {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find patient',
        PATIENT_SERVICE
      );
    }
    return patient;
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<Patient>> => {
    return await this.patientRepository.paginate(paginationDto);
  };

  findPatientByCode = async (patientCode: string): Promise<Patient | null> => {
    const patient = await this.patientRepository.findByPatientCode(patientCode);
    if (!patient) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find patient by code',
        PATIENT_SERVICE
      );
    }
    return patient;
  };

  getPatientStats = async (): Promise<PatientStatsDto> => {
    return await this.patientRepository.getPatientStats();
  };

  update = async (
    id: string,
    updatePatientDto: UpdatePatientDto
  ): Promise<Patient | null> => {
    const patient = await this.checkPatient(id);
    return await this.patientRepository.update(id, updatePatientDto);
  };

  remove = async (id: string): Promise<boolean> => {
    await this.checkPatient(id);
    return await this.patientRepository.softDelete(id, 'isDeleted');
  };

  restore = async (id: string): Promise<Patient | null> => {
    await this.checkPatient(id);
    return await this.patientRepository.restore(id);
  };
}
