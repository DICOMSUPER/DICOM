import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BaseRepository,
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ImagingOrder } from '@backend/shared-domain';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { ImagingOrderStatus, OrderStatus } from '@backend/shared-enums';

export interface QueueInfo {
  [roomId: string]: {
    maxWaiting: { queueNumber: number; entity?: ImagingOrder } | null;
    currentInProgress: {
      queueNumber: number;
      entity?: ImagingOrder;
    } | null;
  };
}

export interface FilterByRoomIdType {
  roomId: string;
  modalityId?: string;
  orderStatus?: ImagingOrderStatus;
  procedureId?: string;
  bodyPart?: string;
}
@Injectable()
export class ImagingOrderRepository extends BaseRepository<ImagingOrder> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(ImagingOrder, entityManager);
  }

  async findImagingOrderByReferenceId(
    id: string,
    type: 'physician' | 'room' | 'patient' | 'visit',
    paginationDto: RepositoryPaginationDto,
    entityManager?: EntityManager
  ) {
    const repository = this.getRepository(entityManager);
    const {
      page = 1,
      limit = 10,
      sortField,
      order,
      relation,
      searchField,
      search,
    } = paginationDto;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    let referenceField;
    switch (type) {
      case 'physician':
        referenceField = 'orderingPhysicianId';
        break;
      case 'room':
        referenceField = 'roomId';
        break;

      case 'patient':
        referenceField = 'patientId';
        break;
      case 'visit':
        referenceField = 'visitId';
        break;

      default:
        throw ThrowMicroserviceException(
          HttpStatus.BAD_REQUEST,
          'Invalid type find by referenceId for ImagingOrder',
          IMAGING_SERVICE
        );
    }

    const query = repository.createQueryBuilder('entity');

    query.andWhere(`entity.${referenceField} = :referenceId`, {
      referenceId: id,
    });

    //  Search filter
    if (search && searchField) {
      query.andWhere(`entity.${searchField} LIKE :search`, {
        search: `%${search}%`,
      });
    }

    //  Relations
    if (relation?.length) {
      relation.forEach((r) => query.leftJoinAndSelect(`entity.${r}`, r));
    }

    // Sorting
    if (sortField && order) {
      query.orderBy(
        `entity.${sortField}`,
        order.toUpperCase() as 'ASC' | 'DESC'
      );
    }

    //  Exclude soft-deleted
    if (this.hasIsDeletedColumn()) {
      query.andWhere('entity.isDeleted = :isDeleted', { isDeleted: false });
    }

    query.skip(skip).take(safeLimit);

    const [data, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total / safeLimit);
    const hasNextPage = safePage < totalPages;
    const hasPreviousPage = safePage > 1;

    return new PaginatedResponseDto<ImagingOrder>(
      data,
      total,
      safePage,
      safeLimit,
      totalPages,
      hasNextPage,
      hasPreviousPage
    );
  }

  async filterImagingOrderByRoomId(
    data: FilterByRoomIdType
  ): Promise<ImagingOrder[]> {
    const repository = await this.getRepository();
    const qb = await repository
      .createQueryBuilder('order')
      .andWhere('order.roomId = :roomId', { roomId: data.roomId })
      .leftJoinAndSelect('order.procedure', 'procedure')
      .innerJoinAndSelect('procedure.modality', 'modality')
      .innerJoinAndSelect('procedure.bodyPart', 'bodyPart')
      .leftJoinAndSelect('order.studies', 'studies')
      .andWhere('order.isDeleted = :notDeleted', { notDeleted: false });

    if (data.modalityId) {
      qb.andWhere('procedure.modalityId = :modalityId', {
        modalityId: data.modalityId,
      });
    }

    if (data.orderStatus) {
      qb.andWhere('order.orderStatus = :orderStatus', {
        orderStatus: data.orderStatus,
      });
    }

    if (data.procedureId) {
      qb.andWhere('order.procedureId = :procedureId', {
        procedureId: data.procedureId,
      });
    }

    if (data.bodyPart) {
      qb.andWhere('bodyPart.name LIKE :bodyPart', {
        bodyPart: `%${data.bodyPart.trim()}%`,
      });
    }
    return qb.getMany();
  }


  async getRoomStats(id: string) {
    const date = new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const repository = await this.getRepository();

    // Get all orders for this room today
    const allOrders = await repository
      .createQueryBuilder('order')
      .andWhere('order.roomId = :roomId', { roomId: id })
      .andWhere('order.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .andWhere('order.isDeleted = :notDeleted', { notDeleted: false })
      .getMany();

    // Get pending orders (waiting), ordered by orderNumber ASC
    const pendingOrders = allOrders
      .filter((order) => order.orderStatus === OrderStatus.PENDING)
      .sort((a, b) => a.orderNumber - b.orderNumber);

    // Get in-progress orders, ordered by orderNumber ASC
    const inProgressOrders = allOrders
      .filter((order) => order.orderStatus === OrderStatus.IN_PROGRESS)
      .sort((a, b) => a.orderNumber - b.orderNumber);

    // Get completed and cancelled orders for statistics
    const completedOrders = allOrders.filter(
      (order) => order.orderStatus === OrderStatus.COMPLETED
    );
    const cancelledOrders = allOrders.filter(
      (order) => order.orderStatus === OrderStatus.CANCELLED
    );

    const maxWaiting =
      pendingOrders.length > 0
        ? {
          orderNumber: pendingOrders[pendingOrders.length - 1].orderNumber,
          entity: pendingOrders[pendingOrders.length - 1],
        }
        : null;

    const currentInProgress =
      inProgressOrders.length > 0
        ? {
          orderNumber: inProgressOrders[0].orderNumber,
          entity: inProgressOrders[0],
        }
        : null;

    return {
      maxWaiting,
      currentInProgress,
      stats: {
        total: allOrders.length,
        waiting: pendingOrders.length,
        inProgress: inProgressOrders.length,
        completed: completedOrders.length,
        cancelled: cancelledOrders.length,
      },
    };
  }
  async findByPatientIdWithPagination(
    patientId: string,
    paginationDto: RepositoryPaginationDto,
    entityManager?: EntityManager,
  ): Promise<PaginatedResponseDto<ImagingOrder>> {
    const repository = this.getRepository(entityManager);
    const {
      page = 1,
      limit = 10,
      sortField,
      order,
      relation,
      searchField,
      search,
    } = paginationDto;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    const query = repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.procedure', 'procedure')
      .leftJoinAndSelect('procedure.modality', 'modality')
      .leftJoinAndSelect('procedure.bodyPart', 'bodyPart')
      .leftJoinAndSelect('order.imagingOrderForm', 'imagingOrderForm')
      .where('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('imagingOrderForm.patientId = :patientId', { patientId });

    // Search filter
    if (search && searchField) {
      query.andWhere(`order.${searchField} LIKE :search`, {
        search: `%${search}%`,
      });
    }

    // Sort
    if (sortField && order) {
      query.orderBy(`order.${sortField}`, order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query.orderBy('order.createdAt', 'DESC');
    }

    // Relations (nếu có truyền thêm)
    if (relation?.length) {
      relation.forEach((r) => query.leftJoinAndSelect(`order.${r}`, r));
    }

    query.skip(skip).take(safeLimit);

    const [data, total] = await query.getManyAndCount();

    if (!data || data.length === 0) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'No imaging orders found for this patient',
        IMAGING_SERVICE,
      );
    }

    const totalPages = Math.ceil(total / safeLimit);
    const hasNextPage = safePage < totalPages;
    const hasPreviousPage = safePage > 1;

    return new PaginatedResponseDto<ImagingOrder>(
      data,
      total,
      safePage,
      safeLimit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    );
  }


}
