import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { RedisService } from '@backend/redis';
import {
  CreateDiagnosesReportDto,
  CreateNotificationDto,
  DiagnosesReport,
  DiagnosisReportRepository,
  FilterDiagnosesReportDto,
  PatientEncounter,
  PatientEncounterRepository,
  UpdateDiagnosesReportDto,
} from '@backend/shared-domain';
import {
  DiagnosisStatus,
  NotificationType,
  RelatedEntityType,
} from '@backend/shared-enums';
import {
  createCacheKey,
  ThrowMicroserviceException,
} from '@backend/shared-utils';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DiagnosesReportService {
  constructor(
    @Inject(DiagnosisReportRepository)
    private readonly diagnosisReportRepository: DiagnosisReportRepository,
    @Inject(PatientEncounterRepository)
    private readonly encounterRepository: PatientEncounterRepository,
    @InjectRepository(DiagnosesReport)
    private readonly reportRepository: Repository<DiagnosesReport>,
    @Inject(RedisService)
    private readonly redisService: RedisService,
    @Inject(process.env.SYSTEM_SERVICE_NAME || 'SYSTEM_SERVICE')
    private readonly systemService: ClientProxy
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
    // const encounter = await this.checkEncounter(
    //   createDiagnosesReportDto.encounterId
    // );

    const date = createDiagnosesReportDto.diagnosisDate
      ? new Date(createDiagnosesReportDto.diagnosisDate)
      : new Date();

    const formattedDate = date.toISOString().split('T')[0];

    const data = {
      ...createDiagnosesReportDto,
      diagnosisDate: date,
      diagnosisName: createDiagnosesReportDto.diagnosisName,
      // ??
      // `${encounter?.patient.lastName} ${encounter?.patient.firstName} (${formattedDate})`,
    };
    return await this.diagnosisReportRepository.create(data);
  };

  findAll = async (): Promise<DiagnosesReport[]> => {
    return await this.diagnosisReportRepository.findAll({ where: {} });
  };

  findOne = async (id: string): Promise<DiagnosesReport | null> => {
    const report = await this.diagnosisReportRepository.findById(id, [
      'encounter',
      'encounter.patient',
    ]);
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

  // async findByStudyId(studyId: string): Promise<DiagnosesReport[]> {
  //   if (!studyId) {
  //     throw ThrowMicroserviceException(
  //       HttpStatus.BAD_REQUEST,
  //       'Study ID is required',
  //       PATIENT_SERVICE
  //     );
  //   }

  //   const reports = await this.diagnosisReportRepository.findAll(
  //     { where: { studyId, isDeleted: false }, order: { createdAt: 'DESC' } },
  //     ['encounter', 'encounter.patient']
  //   );

  //   if (!reports || reports.length === 0) {
  //     throw ThrowMicroserviceException(
  //       HttpStatus.NOT_FOUND,
  //       'No diagnosis reports found for this study ID',
  //       PATIENT_SERVICE
  //     );
  //   }

  //   return reports;
  // }
  async findByStudyId(studyId: string): Promise<DiagnosesReport[]> {
    if (!studyId) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Study ID is required',
        PATIENT_SERVICE
      );
    }

    const reports = await this.diagnosisReportRepository.findAll(
      {
        where: { studyId, isDeleted: false },
        order: { createdAt: 'DESC' },
      },
      ['encounter', 'encounter.patient']
    );
    if (!reports || reports.length === 0) {
      return [];
    }

    return reports;
  }
  async findAllWithFilter(
    filter: FilterDiagnosesReportDto,
    userInfo: { userId: string; role: string }
  ): Promise<PaginatedResponseDto<DiagnosesReport>> {
    const {
      page = 1,
      limit = 10,
      patientName,
      diagnosisName,
      diagnosedBy,
      diagnosisDateFrom,
      diagnosisDateTo,
      diagnosisType,
      sortBy,
      order,
    } = filter;

    const keyName = createCacheKey.system(
      'diagnoses_reports',
      undefined,
      'filter_diagnoses_reports',
      { ...filter }
    );

    const cachedService = await this.redisService.get<
      PaginatedResponseDto<DiagnosesReport>
    >(keyName);
    if (cachedService) {
      console.log('📦 DiagnosesReports retrieved from cache');
      return cachedService;
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('diagnosisReport')
      .where('diagnosisReport.isDeleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('diagnosisReport.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient');

    if (patientName) {
      queryBuilder.andWhere(
        `CONCAT(patient.firstName, ' ', patient.lastName) ILIKE :patientName OR 
       CONCAT(patient.lastName, ' ', patient.firstName) ILIKE :patientName`,
        { patientName: `%${patientName}%` }
      );
    }
    if (diagnosisName) {
      queryBuilder.andWhere(
        'diagnosisReport.diagnosisName ILIKE :diagnosisName',
        {
          diagnosisName: `%${diagnosisName}%`,
        }
      );
    }

    if (diagnosedBy) {
      queryBuilder.andWhere('diagnosisReport.diagnosedBy = :diagnosedBy', {
        diagnosedBy,
      });
    }

    if (diagnosisType) {
      queryBuilder.andWhere('diagnosisReport.diagnosisType = :diagnosisType', {
        diagnosisType,
      });
    }

    if (diagnosisDateFrom) {
      const fromDate = new Date(diagnosisDateFrom);
      fromDate.setHours(0, 0, 0, 0);

      queryBuilder.andWhere(
        'diagnosisReport.diagnosisDate >= :diagnosisDateFrom',
        { diagnosisDateFrom: fromDate }
      );
    }
    if (diagnosisDateTo) {
      const toDate = new Date(diagnosisDateTo);
      toDate.setHours(23, 59, 59, 999);

      queryBuilder.andWhere(
        'diagnosisReport.diagnosisDate <= :diagnosisDateTo',
        { diagnosisDateTo: toDate }
      );
    }
    if (userInfo.role === 'physician') {
      queryBuilder.andWhere('encounter.assignedPhysicianId = :userId', {
        userId: userInfo.userId,
      });
    }

    if (sortBy && order) {
      const sortField =
        sortBy === 'diagnosisDate'
          ? 'diagnosisDate'
          : sortBy === 'id'
          ? 'id'
          : 'createdAt';
      queryBuilder.orderBy(
        `diagnosisReport.${sortField}`,
        order.toUpperCase() as 'ASC' | 'DESC'
      );
    } else {
      queryBuilder.orderBy('diagnosisReport.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const response = new PaginatedResponseDto(
      data,
      total,
      page,
      limit,
      totalPages,
      page < totalPages,
      page > 1
    );

    await this.redisService.set(keyName, response, 1800);

    return response;
  }

  getStats = async (userInfo?: {
    userId: string;
    role: string;
  }): Promise<{
    total: number;
    active: number;
    resolved: number;
    critical: number;
    today: number;
  }> => {
    return await this.diagnosisReportRepository.getStats(userInfo);
  };

  rejectDiagnosisReport = async (
    id: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<DiagnosesReport> => {
    const report = await this.checkDiagnosesReport(id);

    if (report.diagnosisStatus !== DiagnosisStatus.PENDING_APPROVAL) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Only reports with pending approval status can be rejected',
        PATIENT_SERVICE
      );
    }

    const updatedReport = await this.diagnosisReportRepository.update(id, {
      diagnosisStatus: DiagnosisStatus.REJECTED,
      rejectedBy,
      rejectedAt: new Date(),
      rejectionReason,
    });
    const notificationPayload: CreateNotificationDto = {
      recipientId: report.diagnosedBy,
      senderId: rejectedBy as string,
      notificationType: NotificationType.ASSIGNMENT,
      title: 'Reject diagnosis',
      relatedEntityType: RelatedEntityType.REPORT,
      relatedEntityId: report.id,
      message: `Your diagnosis report "${report.diagnosisName}" has been rejected. With reason: ${rejectionReason}`,
    };
    await firstValueFrom(
      this.systemService.send('notification.create', notificationPayload)
    );
    return updatedReport!;
  };

  approveDiagnosisReport = async (
    id: string,
    approvedBy: string
  ): Promise<DiagnosesReport> => {
    const report = await this.checkDiagnosesReport(id);

    if (report.diagnosisStatus !== DiagnosisStatus.PENDING_APPROVAL) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Only reports with pending approval status can be approved',
        PATIENT_SERVICE
      );
    }

    const updatedReport = await this.diagnosisReportRepository.update(id, {
      diagnosisStatus: DiagnosisStatus.APPROVED,
      approvedBy,
      approvedAt: new Date(),
    });

    const notificationPayload: CreateNotificationDto = {
      recipientId: report.diagnosedBy,
      senderId: approvedBy as string,
      notificationType: NotificationType.ASSIGNMENT,
      title: 'Diagnosis report approved',
      relatedEntityType: RelatedEntityType.REPORT,
      relatedEntityId: report.id,
      message: `Your diagnosis report "${report.diagnosisName}" has been approved.`,
    };
    await firstValueFrom(
      this.systemService.send('notification.create', notificationPayload)
    );


    return updatedReport!;
  };
}
