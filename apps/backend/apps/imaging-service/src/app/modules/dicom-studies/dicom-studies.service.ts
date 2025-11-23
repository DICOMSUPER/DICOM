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
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { InjectEntityManager } from '@nestjs/typeorm';
import { RedisService } from '@backend/redis';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
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

    //not allow creating studies for completed and cancelled order
    //could be adjust later
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
      //check imaging order
      await this.checkImagingOrder(createDicomStudyDto.orderId, em);

      //check imaging modality
      await this.checkImagingModality(createDicomStudyDto.modalityId, em);

      return await this.dicomStudiesRepository.create(createDicomStudyDto, em);
    });
  };

  findAll = async (): Promise<DicomStudy[]> => {
    return await this.dicomStudiesRepository.findAll({ where: {} }, relation);
  };

  findOne = async (id: string): Promise<DicomStudy | null> => {
    //check studies
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
      //check dicom study
      const dicomStudy = await this.checkDicomStudy(id, em);

      //check  imaging order if provided›
      if (
        updateDicomStudyDto.orderId &&
        dicomStudy.orderId !== updateDicomStudyDto.orderId
      )
        await this.checkImagingOrder(updateDicomStudyDto.orderId, em);

      //check imaging modality if provided
      if (
        updateDicomStudyDto.modalityId
        // dicomStudy.modalityId !== updateDicomStudyDto.modalityId
      ) {
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
    userInfo: { userId: string; role: string }
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
    if (cachedService) {
      console.log('📦 ImagingOrderForms retrieved from cache');
      return cachedService;
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.dicomStudiesRepository
      .createQueryBuilder('dicomStudy')
      .leftJoinAndSelect('dicomStudy.imagingOrder', 'imagingOrder')
      .leftJoinAndSelect('imagingOrder.imagingOrderForm', 'imagingOrderForm')
      .leftJoinAndSelect('dicomStudy.modalityMachine', 'modalityMachine')
      .where('dicomStudy.isDeleted = :isDeleted', { isDeleted: false });
    if (patientName) {
      const patients = await firstValueFrom(
        this.patientService.send('PatientService.Patient.FindByName', {
          patientName,
        })
      );

      if (!patients || patients.length === 0) {
        return new PaginatedResponseDto([], 0, page, limit, 0, false, false);
      }

      const patientIds: string[] = patients.map(
        (patient: Patient) => patient.id
      );
      queryBuilder.andWhere('dicomStudy.patientId IN (:...patientIds)', {
        patientIds,
      });
    }
    if (status) {
      queryBuilder.andWhere('dicomStudy.studyStatus = :status', { status });
    }

    // if (dateFrom) {
    //   const fromDate = new Date(dateFrom + 'T00:00:00');
    //   queryBuilder.andWhere('dicomStudy.studyDate >= :dateFrom', {
    //     dateFrom: fromDate.toISOString().split('T')[0], // '2025-11-21'
    //   });
    // }

    // if (dateTo) {
    //   const toDate = new Date(dateTo + 'T23:59:59');
    //   queryBuilder.andWhere('dicomStudy.studyDate <= :dateTo', {
    //     dateTo: toDate.toISOString().split('T')[0],
    //   });
    // }
    if (dateFrom) {
      queryBuilder.andWhere('dicomStudy.studyDate >= :dateFrom', {
        dateFrom, // '2025-11-21'
      });
    }

    if (dateTo) {
      queryBuilder.andWhere('dicomStudy.studyDate <= :dateTo', {
        dateTo, // '2025-11-21'
      });
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
    if (userInfo.role === 'physician') {
      queryBuilder.andWhere('imagingOrderForm.orderingPhysicianId = :userId', {
        userId: userInfo.userId,
      });
      queryBuilder.andWhere('dicomStudy.studyStatus IN (:...status)', {
        status: [DicomStudyStatus.PENDING_APPROVAL, DicomStudyStatus.APPROVED],
      });
    }

    queryBuilder.orderBy('dicomStudy.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Fetch patient details
    if (data.length > 0) {
      const patientIds = [
        ...new Set(data.map((dicomStudy) => dicomStudy.patientId)),
      ];
      try {
        console.log('Sending request to PatientService.Patient.Filter...');
        const patientByIds = await firstValueFrom(
          this.patientService.send('PatientService.Patient.Filter', {
            patientIds,
          })
        );

        if (patientByIds) {
          const patientMap = new Map(
            patientByIds.map((patient: any) => [patient.id, patient])
          );

          data.forEach((dicomStudy: any, index) => {
            const patient = patientMap.get(dicomStudy.patientId);

            if (patient) {
              dicomStudy.patient = patient;
              console.log('  - Patient attached:', dicomStudy.patient);
            }
          });
        } else {
          console.log('No patient data in response');
          console.log('Response structure:', patientByIds);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    } else {
      console.log('No orders to process');
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

    // Disable cache for now
    await this.redisService.set(keyName, response, 1800);

    return response;
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
    const startDate = new Date(dateFrom || '');
    const endDate = new Date(dateTo || '');

    // if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    //   throw new Error('Invalid date format. Expected format: YYYY-MM-DD');
    // }

    if (startDate > endDate) {
      throw new Error('dateFrom cannot be greater than dateTo');
    }
    // if (roomId) {
    //   const serviceRooms = await firstValueFrom(
    //     this.userService.send('UserService.ServiceRooms.FindByRoom', { roomId })
    //   );
    //   console.log('getStatsInDateRange serviceRooms', serviceRooms);
    //   if (serviceRooms && serviceRooms.length > 0) {
    //     const serviceRoomIds = serviceRooms.map((sr: any) => sr.id);
    //     return await this.dicomStudiesRepository.getStatsInDateRange(
    //       dateFrom,
    //       dateTo,
    //       serviceRoomIds,
    //       userInfo
    //     );
    //   }
    // }

    return await this.dicomStudiesRepository.getStatsInDateRange(
      dateFrom,
      dateTo,
      roomId,
      userInfo
    );
  };
}
