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
import { DicomStudyStatus, OrderStatus } from '@backend/shared-enums';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';

//relation: imagingOrder, series
const relation = ['imagingOrder', 'series'];

@Injectable()
export class DicomStudiesService {
  constructor(
    @Inject()
    private readonly dicomStudiesRepository: DicomStudiesRepository,
    @Inject()
    private readonly imagingModalitiesRepository: ImagingModalityRepository,
    @Inject()
    private readonly imagingOrdersRepository: ImagingOrderRepository
  ) {}
  private checkDicomStudy = async (id: string): Promise<DicomStudy> => {
    const dicomStudy = await this.dicomStudiesRepository.findOne({
      where: { id },
    });

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
    id: string
  ): Promise<ImagingModality> => {
    const imagingModality = await this.imagingModalitiesRepository.findOne({
      where: { id },
    });

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

  private checkImagingOrder = async (id: string): Promise<ImagingOrder> => {
    const imagingOrder = await this.imagingOrdersRepository.findOne({
      where: { id },
    });

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
        'Failed to create dicom study: Invalid status for ImagingOrder',
        IMAGING_SERVICE
      );
    }
    return imagingOrder;
  };

  create = async (
    createDicomStudyDto: CreateDicomStudyDto
  ): Promise<DicomStudy> => {
    //check imaging order
    await this.checkImagingOrder(createDicomStudyDto.orderId);

    //check imaging modality
    await this.checkImagingModality(createDicomStudyDto.modalityId);

    return await this.dicomStudiesRepository.create(createDicomStudyDto);
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
    //check dicom study
    const dicomStudy = await this.checkDicomStudy(id);

    //check  imaging order if provided›
    if (
      updateDicomStudyDto.orderId &&
      dicomStudy.orderId !== updateDicomStudyDto.orderId
    )
      await this.checkImagingOrder(updateDicomStudyDto.orderId);

    //check imaging modality if provided
    if (
      updateDicomStudyDto.modalityId
      // dicomStudy.modalityId !== updateDicomStudyDto.modalityId
    ) {
      await this.checkImagingModality(updateDicomStudyDto.modalityId);
    }

    return await this.dicomStudiesRepository.update(id, updateDicomStudyDto);
  };

  remove = async (id: string): Promise<boolean> => {
    await this.checkDicomStudy(id);

    return await this.dicomStudiesRepository.softDelete(id, 'isDeleted');
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

  filter = async (
    studyUID?: string,
    startDate?: string,
    endDate?: string,
    bodyPart?: string,
    modalityCode?: string,
    modalityDevice?: string,
    studyStatus?: DicomStudyStatus
  ) => {
    return await this.dicomStudiesRepository.filter(
      studyUID,
      startDate,
      endDate,
      bodyPart,
      modalityCode,
      modalityDevice,
      studyStatus
    );
  };
}
