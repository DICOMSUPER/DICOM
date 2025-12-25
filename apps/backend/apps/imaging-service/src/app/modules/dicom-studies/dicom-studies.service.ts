import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreateDicomStudyDto,
  DicomStudy,
  FilterDicomStudyFormDto,
  ImagingModality,
  ImagingOrder,
  Patient,
  UpdateDicomStudyDto,
} from '@backend/shared-domain';
import { DicomStudyStatus, OrderStatus } from '@backend/shared-enums';
import {
  createCacheKey,
  ThrowMicroserviceException,
} from '@backend/shared-utils';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { InjectEntityManager } from '@nestjs/typeorm';
import { RedisService } from '@backend/redis';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { EntityManager } from 'typeorm';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import { ImagingOrderRepository } from '../imaging-orders/imaging-orders.repository';
import { FilterData } from './dicom-studies.controller';
import {
  DicomStudiesRepository,
  findDicomStudyByReferenceIdType,
} from './dicom-studies.repository';

//relation: imagingOrder, series, modalityMachine
const relation = [
  'imagingOrder',
  'imagingOrder.imagingOrderForm',
  'imagingOrder.procedure',
  'series',
  'modalityMachine',
];

@Injectable()
export class DicomStudiesService {
  private readonly logger = new Logger(DicomStudiesService.name);

  constructor(
    @Inject()
    private readonly dicomStudiesRepository: DicomStudiesRepository,
    @Inject()
    private readonly imagingModalitiesRepository: ImagingModalityRepository,
    @Inject()
    private readonly imagingOrdersRepository: ImagingOrderRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly redisService: RedisService,
    @Inject(process.env.PATIENT_SERVICE_NAME || 'PATIENT_SERVICE')
    private readonly patientService: ClientProxy
  ) {}
  private checkDicomStudy = async (
    id: string,
    em?: EntityManager
  ): Promise<DicomStudy> => {
    const dicomStudy = await this.dicomStudiesRepository.findOne(
      {
        where: { id },
      },
      [],
      em
    );

    if (!dicomStudy) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Dicom study not found',
        IMAGING_SERVICE
      );
    }

    return dicomStudy;
  };

  private checkImagingModality = async (
    id: string,
    em?: EntityManager
  ): Promise<ImagingModality> => {
    const imagingModality = await this.imagingModalitiesRepository.findOne(
      {
        where: { id },
      },
      [],
      em
    );

    if (!imagingModality) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to process dicom study: Modality not found',
        IMAGING_SERVICE
      );
    }

    if (imagingModality?.isActive === false) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to process dicom study: Modality not available',
        IMAGING_SERVICE
      );
    }

    return imagingModality;
  };

  private checkImagingOrder = async (
    id: string,
    em?: EntityManager
  ): Promise<ImagingOrder> => {
    const imagingOrder = await this.imagingOrdersRepository.findOne(
      {
        where: { id },
      },
      [],
      em
    );
  
    if (!imagingOrder) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to create dicom study: ImagingOrder not found',
        IMAGING_SERVICE
      );
    }

    if (
      [OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(
        imagingOrder?.orderStatus
      )
    ) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to create dicom study: can not create studies for completed or canceled order',
        IMAGING_SERVICE
      );
    }
    return imagingOrder;
  };


  create = async (
    createDicomStudyDto: CreateDicomStudyDto
  ): Promise<DicomStudy> => {
    return this.entityManager.transaction(async (em) => {
      await this.checkImagingOrder(createDicomStudyDto.orderId, em);
      // await this.checkImagingModality(createDicomStudyDto.modalityId as string, em);

      return await this.dicomStudiesRepository.create(createDicomStudyDto, em);
    });
  };

  findAll = async (data: { orderId?: string }): Promise<DicomStudy[]> => {
    const whereClause: any = { isDeleted: false };
    if (data?.orderId) {
      await this.checkImagingOrder(data.orderId);
      whereClause.orderId = data.orderId;
    }
    return await this.dicomStudiesRepository.findAll(
      { where: whereClause },
      relation
    );
  };

  findOne = async (id: string): Promise<DicomStudy | null> => {
    await this.checkDicomStudy(id);

    return await this.dicomStudiesRepository.findOne(
      { where: { id: id } },
      relation
    );
  };

  update = async (
    id: string,
    updateDicomStudyDto: UpdateDicomStudyDto
  ): Promise<DicomStudy | null> => {
    return this.entityManager.transaction(async (em) => {
      const dicomStudy = await this.checkDicomStudy(id, em);

      if (
        updateDicomStudyDto.orderId &&
        dicomStudy.orderId !== updateDicomStudyDto.orderId
      ) {
        await this.checkImagingOrder(updateDicomStudyDto.orderId, em);
      }

      if (updateDicomStudyDto.modalityId) {
        await this.checkImagingModality(updateDicomStudyDto.modalityId, em);
      }

      return await this.dicomStudiesRepository.update(
        id,
        updateDicomStudyDto,
        em
      );
    });
  };

  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      await this.checkDicomStudy(id, em);

      return await this.dicomStudiesRepository.softDelete(id, 'isDeleted', em);
    });
  };

  findDicomStudiesByReferenceId = async (
    id: string,
    type: findDicomStudyByReferenceIdType,
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<DicomStudy>> => {
    return await this.dicomStudiesRepository.findDicomStudiesByReferenceId(
      id,
      type,
      { ...paginationDto, relation }
    );
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<DicomStudy>> => {
    return await this.dicomStudiesRepository.paginate({
      ...paginationDto,
      relation,
    });
  };

  filter = async (data: FilterData): Promise<DicomStudy[]> => {
    return await this.dicomStudiesRepository.filter(data);
  };
  async filterWithPagination(
    filter: FilterDicomStudyFormDto,
    userInfo?: { userId: string; role: string }
  ): Promise<PaginatedResponseDto<DicomStudy>> {
    const {
      page = 1,
      limit = 10,
      patientName,
      status,
      dateFrom,
      dateTo,
      modalityMachineId,
      orderId,
      sortBy,
      order,
    } = filter;

    const keyName = createCacheKey.system(
      'dicom_studies',
      undefined,
      'filter_dicom_studies',
      { ...filter }
    );

    const cachedService = await this.redisService.get<
      PaginatedResponseDto<DicomStudy>
    >(keyName);
    // if (cachedService) {
    //   return cachedService;
    // }

    const skip = (page - 1) * limit;
    const queryBuilder = this.dicomStudiesRepository
      .createQueryBuilder('dicomStudy')
      .leftJoinAndSelect('dicomStudy.imagingOrder', 'imagingOrder')
      .leftJoinAndSelect('imagingOrder.imagingOrderForm', 'imagingOrderForm')
      .leftJoinAndSelect('dicomStudy.modalityMachine', 'modalityMachine')
      .leftJoinAndSelect('modalityMachine.modality', 'modality')
      .where('dicomStudy.isDeleted = :isDeleted', { isDeleted: false });

    if (patientName) {
      const patientIds = await this.fetchPatientIdsByName(patientName);
      if (patientIds.length === 0) {
        return new PaginatedResponseDto([], 0, page, limit, 0, false, false);
      }
      queryBuilder.andWhere('dicomStudy.patientId IN (:...patientIds)', {
        patientIds,
      });
    }

    if (status) {
      queryBuilder.andWhere('dicomStudy.studyStatus = :status', { status });
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom + 'T00:00:00');
      queryBuilder.andWhere('dicomStudy.studyDate >= :dateFrom', {
        dateFrom: fromDate,
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo + 'T23:59:59.999');
      queryBuilder.andWhere('dicomStudy.studyDate <= :dateTo', {
        dateTo: toDate,
      });
    }
    // if does not provide dateFrom and dateTo, default to today
    if (!dateFrom && !dateTo) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date();
      tomorrow.setHours(23, 59, 59, 999);
      queryBuilder.andWhere(
        'dicomStudy.studyDate BETWEEN :today AND :tomorrow',
        {
          today: today,
          tomorrow: tomorrow,
        }
      );
    }

    if (modalityMachineId) {
      queryBuilder.andWhere(
        'dicomStudy.modalityMachineId = :modalityMachineId',
        { modalityMachineId }
      );
    }

    if (orderId) {
      queryBuilder.andWhere('dicomStudy.orderId = :orderId', { orderId });
    }

    if (userInfo && userInfo.role === 'physician') {
      queryBuilder.andWhere('imagingOrderForm.orderingPhysicianId = :userId', {
        userId: userInfo.userId,
      });
      queryBuilder.andWhere('dicomStudy.studyStatus IN (:...status)', {
        status: [
          DicomStudyStatus.PENDING_APPROVAL,
          DicomStudyStatus.APPROVED,
          DicomStudyStatus.RESULT_PRINTED,
        ],
      });
    }

    if (sortBy && order) {
      const sortField = sortBy === 'studyDate' ? 'studyDate' : sortBy;
      queryBuilder.orderBy(
        `dicomStudy.${sortField}`,
        order.toUpperCase() as 'ASC' | 'DESC'
      );
    } else {
      queryBuilder.orderBy('dicomStudy.createdAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    if (data.length > 0) {
      await this.attachPatientData(data);
    }

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

    try {
      await this.redisService.set(keyName, response, 1800);
    } catch (error) {
      this.logger.warn('Failed to cache response', error);
    }

    return response;
  }

  private async fetchPatientIdsByName(patientName: string): Promise<string[]> {
    try {
      const patients = await firstValueFrom(
        this.patientService
          .send('PatientService.Patient.FindByName', { patientName })
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error('Error fetching patients by name', error);
              return of([]);
            })
          )
      );

      return patients?.map((patient: Patient) => patient.id) || [];
    } catch (error) {
      this.logger.error('Error fetching patients by name', error);
      return [];
    }
  }

  private async attachPatientData(studies: DicomStudy[]): Promise<void> {
    const patientIds = [...new Set(studies.map((study) => study.patientId))];

    try {
      const patients = await firstValueFrom(
        this.patientService
          .send('PatientService.Patient.Filter', { patientIds })
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error('Error fetching patients by IDs', error);
              return of([]);
            })
          )
      );

      if (patients && patients.length > 0) {
        const patientMap = new Map(
          patients.map((patient: Patient) => [patient.id, patient])
        );

        studies.forEach((study) => {
          const patient = patientMap.get(study.patientId);
          if (patient) {
            (study as any).patient = patient;
          }
        });
      }
    } catch (error) {
      this.logger.error('Error attaching patient data', error);
    }
  }

  findByOrderId = async (orderId: string): Promise<DicomStudy[]> => {
    const imagingOrder = await this.imagingOrdersRepository.findOne({
      where: { id: orderId },
    });

    if (!imagingOrder) {
      return [];
    }
    const studies = await this.dicomStudiesRepository.findAll(
      { where: { orderId } },
      relation
    );
    return studies ?? [];
  };
  getStatsInDateRange = async (
    dateFrom?: string,
    dateTo?: string,
    roomId?: string,
    userInfo?: { userId: string; role: string }
  ): Promise<any> => {
    const today = new Date().toISOString().split('T')[0];
    const finalDateFrom = dateFrom || today;
    const finalDateTo = dateTo || today;

    const startDate = new Date(finalDateFrom);
    const endDate = new Date(finalDateTo);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format. Expected format: YYYY-MM-DD');
    }

    if (startDate > endDate) {
      throw new Error('dateFrom cannot be greater than dateTo');
    }

    const [todayStats, totalStats] = await Promise.all([
      this.dicomStudiesRepository.getStatsInDateRange(
        finalDateFrom,
        finalDateTo,
        roomId,
        userInfo
      ),
      this.dicomStudiesRepository.getTotalStats(roomId, userInfo),
    ]);

    return {
      today: todayStats,
      total: totalStats,
    };
  };
}
