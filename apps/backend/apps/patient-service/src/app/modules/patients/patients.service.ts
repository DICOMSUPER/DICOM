import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreatePatientDto,
  UpdatePatientDto,
  Patient,
  // PatientStatsDto,
  PatientRepository,
  DiagnosisReportRepository,
  PatientCondition,
} from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';
import { v4 as uuidv4 } from 'uuid';
import { DiagnosisStatus } from '@backend/shared-enums';
import { VitalSignsSimplified } from '@backend/shared-interfaces';

export interface PatientOverview {
  recentVitalSigns: VitalSignsSimplified;
  recentConditions: PatientCondition[];
}
@Injectable()
export class PatientService {
  constructor(
    @Inject()
    private readonly diagnosisReportRepository: DiagnosisReportRepository,
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
    const timestamp = Date.now().toString(36); // base36 timestamp
    const rand = Math.floor(Math.random() * 46656)
      .toString(36)
      .padStart(3, '0');
    return (timestamp + rand).toUpperCase().slice(0, 8);
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

  findPatientByName = async (patientName: string): Promise<Patient[]> => {
    const patients = await this.patientRepository.filterPatientName(
      patientName
    );
    if (!patients) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find patient by name',
        PATIENT_SERVICE
      );
    }
    return patients;
  };

  getOverview = async (
    patientCode: string
  ): Promise<PatientOverview | null> => {
    const patient = await this.patientRepository.findByPatientCode(patientCode);

    if (!patient) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find patient by code',
        PATIENT_SERVICE
      );
    }
    const patientOverview = {
      recentVitalSigns: patient?.encounters[0]
        .vitalSigns as VitalSignsSimplified,
      recentConditions: patient?.conditions.slice(0, 3) || [],
    };

    return patientOverview;
  };

  getPatientStats = async () => {
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

  restore = async (id: string): Promise<boolean> => {
    await this.checkPatient(id);
    return await this.patientRepository.restorePatient(id);
  };

  filter = async (
    patientIds: string[] | [],
    patientFirstName?: string,
    patientLastName?: string,
    patientCode?: string
  ): Promise<Patient[]> => {
    return await this.patientRepository.filter(
      patientIds,
      patientFirstName,
      patientLastName,
      patientCode
    );
  };
}
