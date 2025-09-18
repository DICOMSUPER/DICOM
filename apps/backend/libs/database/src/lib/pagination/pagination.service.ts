import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  Repository,
  ObjectLiteral,
  FindOptionsWhere,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsRelations,
} from 'typeorm';
import { PaginatedResponseDto } from './paginated-response.dto';
import { PaginationDto } from './pagination.dto';

@Injectable()
export class PaginationService {
  constructor(private readonly entityManager: EntityManager) {}

  /**
   * Generic pagination method for any TypeORM entity
   * @param entityClass - The entity class
   * @param paginationDto - Pagination parameters (page, limit)
   * @param options - TypeORM query options (where, order, relations, select)
   * @returns Paginated response with data and metadata
   */
  async paginate<T extends ObjectLiteral>(
    entityClass: new () => T,
    paginationDto: PaginationDto,
    options: {
      where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
      order?: FindOptionsOrder<T>;
      relations?: FindOptionsRelations<T>;
      select?: FindOptionsSelect<T>;
    } = {}
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10 } = paginationDto;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));

    // Calculate skip for pagination
    const skip = (safePage - 1) * safeLimit;

    // Get repository for the entity
    const repository: Repository<T> =
      this.entityManager.getRepository(entityClass);

    const total = await repository.count({
      where: options.where,
    });

    // Fetch paginated data
    const data = await repository.find({
      skip,
      take: safeLimit,
      where: options.where,
      order: options.order,
      relations: options.relations,
      select: options.select,
    });

    // Calculate metadata
    const totalPages = Math.ceil(total / safeLimit);
    const hasNextPage = safePage < totalPages;
    const hasPreviousPage = safePage > 1;

    return new PaginatedResponseDto<T>(
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
