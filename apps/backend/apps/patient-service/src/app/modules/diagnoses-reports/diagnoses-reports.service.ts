import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateDiagnosesReportDto,
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
import { DiagnosisStatus } from 'libs/shared-enums/src';

@Injectable()
export class DiagnosesReportService {
  constructor(
    @Inject()
    private readonly diagnosisReportRepository: DiagnosisReportRepository
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

  create = async (
    createDiagnosesReportDto: CreateDiagnosesReportDto
  ): Promise<DiagnosesReport> => {
    return await this.diagnosisReportRepository.create(
      createDiagnosesReportDto
    );
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

  filter = async (studyIds: string[], reportStatus?: DiagnosisStatus) => {
    return await this.diagnosisReportRepository.filter(studyIds, reportStatus);
  };
}
