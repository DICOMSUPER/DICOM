import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateDiagnosesReportDto,
  PatientEncounter,
  PatientEncounterRepository,
  UpdateDiagnosesReportDto,
} from '@backend/shared-domain';
import {
  DiagnosisReportRepository,
  DiagnosesReport,
} from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';
import { DiagnosisStatus } from '@backend/shared-enums';

@Injectable()
export class DiagnosesReportService {
  constructor(
    @Inject()
    private readonly diagnosisReportRepository: DiagnosisReportRepository,
    private readonly encounterRepository: PatientEncounterRepository
  ) {}

  private checkDiagnosesReport = async (
    id: string
  ): Promise<DiagnosesReport> => {
    const report = await this.diagnosisReportRepository.findById(id);
    if (!report) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Diagnoses report not found',
        PATIENT_SERVICE
      );
    }
    return report;
  };

  private checkEncounter = async (
    id: string
  ): Promise<PatientEncounter | null> => {
    const encounter = await this.encounterRepository.findById(id, ['patient']);

    if (!encounter) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Encounter not found',
        PATIENT_SERVICE
      );
    }

    return encounter;
  };

  create = async (
    createDiagnosesReportDto: CreateDiagnosesReportDto
  ): Promise<DiagnosesReport> => {
    const encounter = await this.checkEncounter(
      createDiagnosesReportDto.encounterId
    );

    const date = createDiagnosesReportDto.diagnosisDate
      ? new Date(createDiagnosesReportDto.diagnosisDate)
      : new Date();

    const formattedDate = date.toISOString().split('T')[0];

    const data = {
      ...createDiagnosesReportDto,
      diagnosisName:
        createDiagnosesReportDto.diagnosisName ??
        `${encounter?.patient.lastName} ${encounter?.patient.firstName} (${formattedDate})`,
    };
    return await this.diagnosisReportRepository.create(data);
  };

  findAll = async (): Promise<DiagnosesReport[]> => {
    return await this.diagnosisReportRepository.findAll({ where: {} });
  };

  findOne = async (id: string): Promise<DiagnosesReport | null> => {
    const report = await this.diagnosisReportRepository.findById(id);
    if (!report) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find diagnoses report',
        PATIENT_SERVICE
      );
    }
    return report;
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<DiagnosesReport>> => {
    return await this.diagnosisReportRepository.paginate(paginationDto);
  };

  update = async (
    id: string,
    updateDiagnosesReportDto: UpdateDiagnosesReportDto
  ): Promise<DiagnosesReport | null> => {
    const report = await this.checkDiagnosesReport(id);
    return await this.diagnosisReportRepository.update(
      id,
      updateDiagnosesReportDto
    );
  };

  remove = async (id: string): Promise<boolean> => {
    await this.checkDiagnosesReport(id);
    return await this.diagnosisReportRepository.softDelete(id, 'isDeleted');
  };

  filter = async (
    studyIds: string[],
    reportStatus?: DiagnosisStatus | string
  ) => {
    return await this.diagnosisReportRepository.filter(studyIds, reportStatus);
  };
}
