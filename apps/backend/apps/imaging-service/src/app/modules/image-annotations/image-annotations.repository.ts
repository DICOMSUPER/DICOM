import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BaseRepository,
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ImageAnnotation } from '@backend/shared-domain';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';

export type FindFilterAnnotation = 'annotator' | 'instance' | 'series';

@Injectable()
export class ImageAnnotationsRepository extends BaseRepository<ImageAnnotation> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(ImageAnnotation, entityManager);
  }

  async findByReferenceId(
    id: string,
    type: FindFilterAnnotation,
    paginationDto: RepositoryPaginationDto,
    entityManager?: EntityManager
  ): Promise<PaginatedResponseDto<ImageAnnotation>> {
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

    let referenceField: string | null = null;
    let requiresSeriesFilter = false;
    switch (type) {
      case 'annotator':
        referenceField = 'annotatorId';
        break;

      case 'instance':
        referenceField = 'instanceId';
        break;
      case 'series':
        requiresSeriesFilter = true;
        break;
      default:
        throw ThrowMicroserviceException(
          HttpStatus.BAD_REQUEST,
          'Invalid type find by referenceId for ImagingAnnotation',
          IMAGING_SERVICE
        );
        break;
    }
    const query = repository.createQueryBuilder('entity');

    if (requiresSeriesFilter) {
      query.leftJoin('entity.instance', 'filterInstance');
      query.andWhere('filterInstance.seriesId = :referenceId', {
        referenceId: id,
      });
    } else if (referenceField) {
      query.andWhere(`entity.${referenceField} = :referenceId`, {
        referenceId: id,
      });
    }

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

    return new PaginatedResponseDto<ImageAnnotation>(
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
