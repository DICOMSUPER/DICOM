import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreatePatientDto,
  UpdatePatientDto,
  Patient,
  PatientStatsDto,
  PatientRepository,
  PatientCondition,
} from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';
import { v4 as uuidv4 } from 'uuid';
import { VitalSignsSimplified } from '@backend/shared-interfaces';

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

  private checkPatientCode = async (
    patientCode: string
  ): Promise<Patient | null> => {
    const patient = await this.patientRepository.findByPatientCode(patientCode);
    if (patient && patient.isDeleted !== false) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Payment code generated has been taken, please try again',
        PATIENT_SERVICE
      );
    }
    return patient;
  };

  private generatePatientCode = (): string => {
    return 'PA' + uuidv4();
  };
  create = async (createPatientDto: CreatePatientDto): Promise<Patient> => {
    const patientCode = this.generatePatientCode();
    this.checkPatientCode(patientCode);
    return await this.patientRepository.create({
      ...createPatientDto,
      patientCode,
    });
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

  getOverview = async (
    patientCode: string
  ): Promise<{
    recentVitalSigns: VitalSignsSimplified;
    recentConditions: PatientCondition[];
  } | null> => {
    const patient = await this.patientRepository.findByPatientCode(patientCode);

    if (!patient) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find patient by code',
        PATIENT_SERVICE
      );
    }
    const patientOverview = {
      recentVitalSigns: patient?.encounters[0].vitalSigns as VitalSignsSimplified,
      recentConditions: patient?.conditions.slice(0, 3) || [],
    };

    return patientOverview;
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
