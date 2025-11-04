import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateDicomStudyDto,
  DicomStudy,
  ImagingModality,
  ImagingOrder,
} from '@backend/shared-domain';
import { UpdateDicomStudyDto } from '@backend/shared-domain';
import {
  DicomStudiesRepository,
  findDicomStudyByReferenceIdType,
} from './dicom-studies.repository';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import { ImagingOrderRepository } from '../imaging-orders/imaging-orders.repository';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { DicomStudyStatus, OrderStatus, Roles } from '@backend/shared-enums';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { FilterData } from './dicom-studies.controller';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

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
    @InjectEntityManager() private readonly entityManager: EntityManager
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
}
