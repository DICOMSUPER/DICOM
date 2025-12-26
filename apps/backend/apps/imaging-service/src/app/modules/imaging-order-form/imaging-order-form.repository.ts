import {
  BaseRepository,
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ImagingOrderForm } from '@backend/shared-domain';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';

export type FilterFieldOrderForm =
  | 'physician'
  | 'room'
  | 'patient'
  | 'encounter';
@Injectable()
export class ImagingOrderFormRepository extends BaseRepository<ImagingOrderForm> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(ImagingOrderForm, entityManager);
  }

  async findImagingOrderFormByReferenceId(
    id: string,
    type: FilterFieldOrderForm,
    paginationDto: RepositoryPaginationDto,
    entityManager?: EntityManager
  ): Promise<PaginatedResponseDto<ImagingOrderForm>> {
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
      case 'encounter':
        referenceField = 'encounterId';
        break;

      default:
        throw ThrowMicroserviceException(
          HttpStatus.BAD_REQUEST,
          'Invalid type find by referenceId for ImagingOrderForm',
          IMAGING_SERVICE
        );
    }

    const query = repository.createQueryBuilder('entity');

    query.andWhere(`entity.${referenceField} = :referenceId`, {
      referenceId: id,
    });

    //  Search filter
    if (search && searchField) {
      query.andWhere(
        `unaccent(LOWER(entity.${searchField})) ILIKE unaccent(LOWER(:search))`,
        { search: `%${search}%` }
      );
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

    return new PaginatedResponseDto<ImagingOrderForm>(
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
