import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { Role } from '@backend/shared-decorators';
import {
  CreateDiagnosesReportDto,
  DiagnosesReport,
  UpdateDiagnosesReportDto
} from '@backend/shared-domain';
import { DiagnosisStatus, Roles } from '@backend/shared-enums';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MESSAGE_PATTERNS,
  PATIENT_SERVICE,
} from '../../../constant/microservice.constant';
import { DiagnosesReportService } from './diagnoses-reports.service';

const moduleName = 'DiagnosesReport';
@Controller('diagnoses-reports')
export class DiagnosesReportController {
  private logger = new Logger(PATIENT_SERVICE);
  constructor(
    private readonly diagnosesReportService: DiagnosesReportService
  ) {}

  @MessagePattern('PatientService.DiagnosesReport.Create')
  async create(
    @Payload() data: { createDiagnosesReportDto: CreateDiagnosesReportDto }
  ): Promise<DiagnosesReport> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createDiagnosesReportDto } = data;
      return await this.diagnosesReportService.create(createDiagnosesReportDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create diagnoses report',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll(): Promise<DiagnosesReport[]> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.diagnosesReportService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all diagnoses reports',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<DiagnosesReport | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.diagnosesReportService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find diagnoses report with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST, Roles.SYSTEM_ADMIN)
  async update(
    @Payload()
    data: {
      id: string;
      updateDiagnosesReportDto: UpdateDiagnosesReportDto;
    }
  ): Promise<DiagnosesReport | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateDiagnosesReportDto } = data;
      return await this.diagnosesReportService.update(
        id,
        updateDiagnosesReportDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update diagnoses report with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`)
  async remove(@Payload() data: { id: string }): Promise<boolean> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`
    );
    try {
      const { id } = data;
      return await this.diagnosesReportService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete diagnoses report with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL_WITH_FILTER}`
  )
  async findAllWithFilter(
    @Payload() data: { filter: any; userInfo: { userId: string; role: string } }
  ): Promise<PaginatedResponseDto<DiagnosesReport>> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL_WITH_FILTER}`
    );
    try {
      return await this.diagnosesReportService.findAllWithFilter(
        data.filter,
        data.userInfo
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all diagnoses reports',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<DiagnosesReport>> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.diagnosesReportService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'diagnosisName',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many diagnoses reports',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Filter`)
  async filterDiagnosisReport(
    @Payload()
    data: {
      studyIds: string[];
      reportStatus?: DiagnosisStatus | string;
    }
  ) {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.Filter`);
    try {
      const { studyIds, reportStatus } = data;
      return await this.diagnosesReportService.filter(studyIds, reportStatus);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to filter diagnoses reports',
        PATIENT_SERVICE
      );
    }
  }
  //find by studyId
  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.FindByStudyId`)
  async findByStudyId(@Payload() data: { studyId: string }) {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.FindByStudyId`
    );
    try {
      const { studyId } = data;
      return await this.diagnosesReportService.findByStudyId(studyId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find diagnoses reports by studyId: ${data.studyId}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetStats`)
  async getStats(
    @Payload()
    data: {
      userInfo?: {
        userId: string;
        role: string;
      };
    }
  ) {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetStats`
    );
    try {
      const { userInfo } = data;
      return await this.diagnosesReportService.getStats(userInfo);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get diagnosis report stats',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Reject`)
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST, Roles.SYSTEM_ADMIN)
  async rejectDiagnosisReport(
    @Payload()
    data: {
      id: string;
      rejectedBy: string;
      rejectionReason: string;
    }
  ): Promise<DiagnosesReport> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.Reject`
    );
    try {
      const { id, rejectedBy, rejectionReason } = data;
      return await this.diagnosesReportService.rejectDiagnosisReport(
        id,
        rejectedBy,
        rejectionReason
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to reject diagnosis report with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Approve`)
  @Role(Roles.PHYSICIAN, Roles.RADIOLOGIST, Roles.SYSTEM_ADMIN)
  async approveDiagnosisReport(
    @Payload()
    data: {
      id: string;
      approvedBy: string;
    }
  ): Promise<DiagnosesReport> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.Approve`
    );
    try {
      const { id, approvedBy } = data;
      return await this.diagnosesReportService.approveDiagnosisReport(
        id,
        approvedBy
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to approve diagnosis report with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }
}
