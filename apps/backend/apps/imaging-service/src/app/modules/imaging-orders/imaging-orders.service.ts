import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateImagingOrderDto,
  ImagingModality,
  ImagingOrder,
  ImagingOrderForm,
} from '@backend/shared-domain';
import { UpdateImagingOrderDto } from '@backend/shared-domain';
import {
  FilterByRoomIdType,
  ImagingOrderRepository,
} from './imaging-orders.repository';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ImagingModalityRepository } from '../imaging-modalities/imaging-modalities.repository';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { OrderStatus } from '@backend/shared-enums';
import { Between } from 'typeorm';
import { ImagingOrderFormRepository } from '../imaging-order-form/imaging-order-form.repository';

const relation = ['procedure'];
@Injectable()
export class ImagingOrdersService {
  constructor(
    @Inject() private readonly imagingOrderRepository: ImagingOrderRepository,
    @Inject()
    private readonly imagingModalityRepository: ImagingModalityRepository,
    @Inject()
    private readonly imagingOrderFormRepository: ImagingOrderFormRepository
  ) { }

  private checkImagingOrder = async (id: string): Promise<ImagingOrder> => {
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

  public async generateOrderNumber(roomId: string): Promise<number> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find all orders for this room created today
    const todayOrderForms = await this.imagingOrderFormRepository.findAll(
      {
        where: {
          roomId: roomId,
          createdAt: Between(startOfDay, endOfDay),
        },
        order: { createdAt: 'DESC' },
        take: 1,
      },

      ['imagingOrders']
    );

    // Extract numbers from existing order numbers and find the max
    let maxNumber = 0;
    if (todayOrderForms && todayOrderForms.length > 0) {
      todayOrderForms[0].imagingOrders.forEach((order: ImagingOrder) => {
        if (order.orderNumber > maxNumber) {
          maxNumber = order.orderNumber;
        }
      });

      return maxNumber + 1;
    } else {
      return 1;
    }
  }

  private checkModality = async (id: string): Promise<ImagingModality> => {
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
    return modality;
  };

  create = async (
    createImagingOrderDto: CreateImagingOrderDto
  ): Promise<ImagingOrder> => {
    const orderForm = await this.imagingOrderFormRepository.findOne(
      {
        where: {
          id: createImagingOrderDto.imagingOrderFormId,
          isDeleted: false,
        },
      },
      ['imagingOrders']
    );
    if (!orderForm) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Order form not found',
        IMAGING_SERVICE
      );
    }

    return await this.imagingOrderRepository.create({
      ...createImagingOrderDto,
      orderStatus: OrderStatus.PENDING,
      procedureId: createImagingOrderDto.request_procedure_id,
      orderNumber: await this.generateOrderNumber(orderForm?.roomId),
    });
  };

  findAll = async (): Promise<ImagingOrder[]> => {
    return await this.imagingOrderRepository.findAll({ where: {} }, relation);
  };

  findOne = async (id: string): Promise<ImagingOrder | null> => {
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

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ImagingOrder>> => {
    return await this.imagingOrderRepository.paginate({
      ...paginationDto,
      relation,
    });
  };

  findImagingOrderByReferenceId = async (
    id: string,
    type: 'physician' | 'room' | 'visit' | 'patient',
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ImagingOrder>> => {
    return await this.imagingOrderRepository.findImagingOrderByReferenceId(
      id,
      type,
      { ...paginationDto, relation }
    );
  };

  update = async (
    id: string,
    updateImagingOrderDto: UpdateImagingOrderDto
  ): Promise<ImagingOrder | null> => {
    const order = await this.checkImagingOrder(id);

    //check availablity when update modality
    // if (
    //   updateImagingOrderDto.modalityId &&
    //   updateImagingOrderDto.modalityId !== order.modalityId
    // )
    //   await this.checkModality(updateImagingOrderDto.modalityId);

    return await this.imagingOrderRepository.update(id, updateImagingOrderDto);
  };

  remove = async (id: string): Promise<boolean> => {
    await this.checkImagingOrder(id);
    return await this.imagingOrderRepository.softDelete(id, 'isDeleted');
  };

  filterImagingOrderByRoomId = async (
    data: FilterByRoomIdType
  ): Promise<ImagingOrder[]> => {
    return await this.imagingOrderRepository.filterImagingOrderByRoomId(data);
  };

  getRoomStats = async (id: string) => {
    return await this.imagingOrderRepository.getRoomStats(id);
  };
  
  findManyByPatientId = async (
    patientId: string
  ): Promise<ImagingOrder[]> => {
    if (!patientId) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'PatientId is required',
        IMAGING_SERVICE,
      );
    }

    return await this.imagingOrderRepository.findAll({
      where: { patientId },
    });
  };
}
