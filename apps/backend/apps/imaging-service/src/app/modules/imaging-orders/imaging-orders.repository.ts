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

export type ReferenceFieldOrderType =
  | 'physician'
  | 'room'
  | 'patient'
  | 'encounter';
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
    type: ReferenceFieldOrderType,
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

    const query = repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.imagingOrderForm', 'imagingOrderForm');

    let referenceField;
    switch (type) {
      case 'physician':
        referenceField = 'imagingOrderForm.orderingPhysicianId';
        break;
      case 'room':
        referenceField = 'imagingOrderForm.roomId';
        break;

      case 'patient':
        referenceField = 'imagingOrderForm.patientId';
        break;
      case 'encounter':
        referenceField = 'imagingOrderForm.encounterId';
        break;

      default:
        throw ThrowMicroserviceException(
          HttpStatus.BAD_REQUEST,
          'Invalid type find by referenceId for ImagingOrder',
          IMAGING_SERVICE
        );
    }

    query.andWhere(`${referenceField} = :referenceId`, {
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
      relation.forEach((r) => {
        const parts = r.split('.');
        let parentAlias = 'entity';
        let currentPath = '';

        for (const part of parts) {
          currentPath = `${parentAlias}.${part}`;
          const alias = `${parentAlias}_${part}`; // unique alias using underscores

          // Only join if this alias doesn’t already exist
          const alreadyJoined = query.expressionMap.joinAttributes.some(
            (join) => join.alias.name === alias
          );

          if (!alreadyJoined) {
            query.leftJoinAndSelect(currentPath, alias);
          }

          parentAlias = alias; // move deeper for next iteration
        }
      });
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
    const repository = this.getRepository();
    const qb = repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.imagingOrderForm', 'imagingOrderForm')
      .andWhere('imagingOrderForm.roomId = :roomId', { roomId: data.roomId })
      .leftJoinAndSelect('order.procedure', 'procedure')
      .innerJoinAndSelect('procedure.modality', 'modality')
      .innerJoinAndSelect('procedure.bodyPart', 'bodyPart')
      .leftJoinAndSelect('order.studies', 'studies')
      .andWhere('order.isDeleted = :notDeleted', { notDeleted: false })
      .addOrderBy('order.createdAt', 'ASC');
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

  async getRoomStatsInDate(id: string) {
    const date = new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const repository = this.getRepository();

    // Get all orders for this room today
    const allOrders = await repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.imagingOrderForm', 'imagingOrderForm')
      .andWhere('imagingOrderForm.roomId = :roomId', { roomId: id })
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

  async getRoomStats(id: string) {
    const repository = this.getRepository();

    // Get all non-deleted orders for this room (all-time)
    const allOrders = await repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.imagingOrderForm', 'imagingOrderForm')
      .andWhere('imagingOrderForm.roomId = :roomId', { roomId: id })
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
}
