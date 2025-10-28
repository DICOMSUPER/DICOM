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

@Injectable()
export class ImagingOrderFormRepository extends BaseRepository<ImagingOrder> {
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
}
