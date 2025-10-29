// imaging-order-form.service.ts
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateImagingOrderFormDto,
  FilterImagingOrderFormDto,
  ImagingOrder,
  ImagingOrderForm,
  UpdateImagingOrderFormDto,
} from '@backend/shared-domain';
import { OrderFormStatus, OrderStatus } from '@backend/shared-enums';
import { createCacheKey } from '@backend/shared-utils';
import { RedisService } from '@backend/redis';
import { ImagingOrdersService } from '../imaging-orders/imaging-orders.service';

@Injectable()
export class ImagingOrderFormService {
  constructor(
    @InjectRepository(ImagingOrderForm)
    private readonly orderFormRepository: Repository<ImagingOrderForm>,
    @InjectRepository(ImagingOrder)
    private readonly orderRepository: Repository<ImagingOrder>,

    private readonly redisService: RedisService,
    private readonly imagingOrdersService: ImagingOrdersService
  ) {}

  async create(
    createOrderFormDto: CreateImagingOrderFormDto,
    userId: string
  ): Promise<ImagingOrderForm> {
    const { imagingOrders, ...formData } = createOrderFormDto;

    return await this.orderFormRepository.manager.transaction(
      async (manager) => {
        const form = manager.create(ImagingOrderForm, {
          ...formData,
          orderingPhysicianId: userId,
        });
        await manager.save(form);
        const createdOrders = await Promise.all(
          imagingOrders.map(async (orderDto) => {
            const order = manager.create(ImagingOrder, {
              ...orderDto,
              imagingOrderFormId: form.id,
              orderStatus: OrderStatus.PENDING,
              orderNumber: await this.imagingOrdersService.generateOrderNumber(
                formData.roomId
              ),
              procedureId: orderDto.request_procedure_id,
            });
            return await manager.save(order);
          })
        );

        form.imagingOrders = createdOrders;
        return form;
      }
    );
  }

  async findAll(
    filter: FilterImagingOrderFormDto
  ): Promise<PaginatedResponseDto<ImagingOrderForm>> {
    const { page = 1, limit = 10, name, patientId, status } = filter;

    const keyName = createCacheKey.system(
      'imaging_order_forms',
      undefined,
      'filter_imaging_order_forms',
      { ...filter }
    );

    const cachedService = await this.redisService.get<
      PaginatedResponseDto<ImagingOrderForm>
    >(keyName);
    if (cachedService) {
      console.log('📦 ImagingOrderForms retrieved from cache');
      return cachedService;
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.orderFormRepository
      .createQueryBuilder('orderForm')
      .where('orderForm.isDeleted = :isDeleted', { isDeleted: false });

    // Apply filters
    if (patientId) {
      queryBuilder.andWhere('orderForm.patientId = :patientId', { patientId });
    }

    if (status) {
      queryBuilder.andWhere('orderForm.orderFormStatus = :status', { status });
    }

    if (name) {
      queryBuilder.andWhere(
        '(modality.modalityName ILIKE :name OR procedure.procedureName ILIKE :name OR orderForm.clinicalIndication ILIKE :name)',
        { name: `%${name}%` }
      );
    }

    queryBuilder.orderBy('orderForm.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    await this.redisService.set(
      keyName,
      new PaginatedResponseDto(
        data,
        total,
        page,
        limit,
        totalPages,
        page < totalPages,
        page > 1
      ),
      1800
    );

    return new PaginatedResponseDto(
      data,
      total,
      page,
      limit,
      totalPages,
      page < totalPages,
      page > 1
    );
  }
  async findOne(id: string): Promise<ImagingOrderForm> {
    const orderForm = await this.orderFormRepository.findOne({
      where: { id, isDeleted: false },
      relations: {
        imagingOrders: true,
      },
    });

    if (!orderForm) {
      throw new NotFoundException(`ImagingOrderForm with ID ${id} not found`);
    }

    return orderForm;
  }

  async update(
    id: string,
    updateDto: UpdateImagingOrderFormDto
  ): Promise<ImagingOrderForm> {
    const orderForm = await this.findOne(id);

    if (
      updateDto.orderFormStatus === OrderFormStatus.COMPLETED &&
      orderForm.orderFormStatus !== OrderFormStatus.COMPLETED
    ) {
      const allOrdersCompleted = await this.checkAllOrdersCompleted(id);
      if (!allOrdersCompleted) {
        throw new BadRequestException(
          'Cannot mark order form as completed. Not all imaging orders are completed.'
        );
      }
    }

    Object.assign(orderForm, updateDto);
    return await this.orderFormRepository.save(orderForm);
  }

  async remove(id: string): Promise<void> {
    const orderForm = await this.findOne(id);

    // Check if there are related imaging orders
    const relatedOrders = await this.orderRepository.find({
      where: { imagingOrderFormId: id },
    });

    for (const order of relatedOrders) {
      order.isDeleted = true;
      await this.orderRepository.save(order);
    }

    orderForm.isDeleted = true;
    await this.orderFormRepository.save(orderForm);
  }

  async findMany(paginationDto: RepositoryPaginationDto) {
    const {
      page = 1,
      limit = 10,
      search = '',
      searchField = 'patientId',
      sortField = 'createdAt',
      order = 'DESC',
    } = paginationDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.orderFormRepository
      .createQueryBuilder('orderForm')
      .leftJoinAndSelect('orderForm.modality', 'modality')
      .leftJoinAndSelect('orderForm.procedure', 'procedure');

    // Search
    if (search && searchField) {
      if (searchField === 'modalityName') {
        queryBuilder.andWhere('modality.modalityName ILIKE :search', {
          search: `%${search}%`,
        });
      } else if (searchField === 'procedureName') {
        queryBuilder.andWhere('procedure.procedureName ILIKE :search', {
          search: `%${search}%`,
        });
      } else {
        queryBuilder.andWhere(`orderForm.${searchField} ILIKE :search`, {
          search: `%${search}%`,
        });
      }
    }

    // Sorting
    if (sortField === 'modalityName') {
      queryBuilder.orderBy('modality.modalityName', order as 'ASC' | 'DESC');
    } else if (sortField === 'procedureName') {
      queryBuilder.orderBy('procedure.procedureName', order as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy(`orderForm.${sortField}`, order as 'ASC' | 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByReferenceId(
    id: string,
    type: 'physician' | 'patient' | 'room',
    paginationDto: RepositoryPaginationDto
  ) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortField = 'createdAt',
      order = 'DESC',
    } = paginationDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.orderFormRepository
      .createQueryBuilder('orderForm')
      .leftJoinAndSelect('orderForm.modality', 'modality')
      .leftJoinAndSelect('orderForm.procedure', 'procedure');

    // Filter by type
    switch (type) {
      case 'patient':
        queryBuilder.andWhere('orderForm.patientId = :id', { id });
        break;
      case 'physician':
        queryBuilder.andWhere('orderForm.orderingPhysicianId = :id', { id });
        break;
      case 'room':
        queryBuilder.andWhere('orderForm.roomId = :id', { id });
        break;
    }

    // Search
    if (search) {
      queryBuilder.andWhere(
        '(orderForm.clinicalIndication ILIKE :search OR orderForm.specialInstructions ILIKE :search OR orderForm.notes ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    queryBuilder.orderBy(`orderForm.${sortField}`, order as 'ASC' | 'DESC');

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Check if all imaging orders for this form are completed
   */
  async checkAllOrdersCompleted(orderFormId: string): Promise<boolean> {
    const totalOrders = await this.orderRepository.count({
      where: { imagingOrderFormId: orderFormId },
    });

    if (totalOrders === 0) {
      return false;
    }

    const completedOrders = await this.orderRepository.count({
      where: {
        imagingOrderFormId: orderFormId,
        orderStatus: OrderStatus.COMPLETED,
      },
    });

    return totalOrders === completedOrders;
  }

  async autoUpdateOrderFormStatus(orderFormId: string): Promise<void> {
    const orderForm = await this.findOne(orderFormId);

    // Skip if already completed or cancelled
    if (
      orderForm.orderFormStatus === OrderFormStatus.COMPLETED ||
      orderForm.orderFormStatus === OrderFormStatus.CANCELLED
    ) {
      return;
    }

    const allOrdersCompleted = await this.checkAllOrdersCompleted(orderFormId);

    if (allOrdersCompleted) {
      orderForm.orderFormStatus = OrderFormStatus.COMPLETED;
      await this.orderFormRepository.save(orderForm);
    }
  }

  async getOrdersByFormId(orderFormId: string): Promise<ImagingOrder[]> {
    return await this.orderRepository.find({
      where: { imagingOrderFormId: orderFormId },
      order: { createdAt: 'ASC' },
    });
  }

  async getOrderFormStatistics(orderFormId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    cancelledOrders: number;
    completionPercentage: number;
  }> {
    const orders = await this.getOrdersByFormId(orderFormId);

    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(
        (o) => o.orderStatus === OrderStatus.COMPLETED
      ).length,
      pendingOrders: orders.filter((o) => o.orderStatus === OrderStatus.PENDING)
        .length,
      inProgressOrders: orders.filter(
        (o) => o.orderStatus === OrderStatus.IN_PROGRESS
      ).length,
      cancelledOrders: orders.filter(
        (o) => o.orderStatus === OrderStatus.CANCELLED
      ).length,
      completionPercentage: 0,
    };

    if (stats.totalOrders > 0) {
      stats.completionPercentage = Math.round(
        (stats.completedOrders / stats.totalOrders) * 100
      );
    }

    return stats;
  }
}
