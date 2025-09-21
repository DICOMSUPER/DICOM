import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateImagingOrderDto } from './dto/create-imaging-order.dto';
import { UpdateImagingOrderDto } from './dto/update-imaging-order.dto';
import { ImagingOrderRepository } from './imaging-orders.repository';
import { RepositoryPaginationDto } from '@backend/database';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';

const relation = ['modality'];
@Injectable()
export class ImagingOrdersService {
  constructor(
    @Inject() private readonly imagingOrderRepository: ImagingOrderRepository,
    @Inject()
    private readonly imagingModalityRepository: ImagingModalityRepository
  ) {}

  private checkImagingOrder = async (id: string) => {
    const order = await this.imagingOrderRepository.findOne({ where: { id } });
    if (!order) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Imaging order not found',
        IMAGING_SERVICE
      );
    }
    return order;
  };

  private checkModality = async (id: string) => {
    const modality = await this.imagingModalityRepository.findById(id);
    if (!modality) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Modality not found',
        IMAGING_SERVICE
      );
    } else if (modality.isActive === false) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Modality not available',
        IMAGING_SERVICE
      );
    }
  };

  create = async (createImagingOrderDto: CreateImagingOrderDto) => {
    await this.checkModality(createImagingOrderDto.modalityId);
    return await this.imagingOrderRepository.create(createImagingOrderDto);
  };

  findAll = async () => {
    return await this.imagingOrderRepository.findAll({ where: {} }, relation);
  };

  findOne = async (id: string) => {
    const order = await this.imagingOrderRepository.findOne(
      { where: { id } },
      relation
    );
    if (!order) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find imaging order',
        IMAGING_SERVICE
      );
    }

    return order;
  };

  findMany = async (paginationDto: RepositoryPaginationDto) => {
    return await this.imagingOrderRepository.paginate({
      ...paginationDto,
      relation,
    });
  };

  findImagingOrderByReferenceId = async (
    id: string,
    type: 'physician' | 'room' | 'visit' | 'patient',
    paginationDto: RepositoryPaginationDto
  ) => {
    return await this.imagingOrderRepository.findImagingOrderByReferenceId(
      id,
      type,
      { ...paginationDto, relation }
    );
  };

  update = async (id: string, updateImagingOrderDto: UpdateImagingOrderDto) => {
    const order = await this.checkImagingOrder(id);

    //check availablity when update modality
    if (
      updateImagingOrderDto.modalityId &&
      updateImagingOrderDto.modalityId !== order.modalityId
    )
      await this.checkModality(updateImagingOrderDto.modalityId);

    return await this.imagingOrderRepository.update(id, updateImagingOrderDto);
  };

  remove = async (id: string) => {
    await this.checkImagingOrder(id);
    return await this.imagingOrderRepository.softDelete(id, 'isDeleted');
  };
}
