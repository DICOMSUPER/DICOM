import { EntityManager, ObjectLiteral, FindOptionsWhere, FindOptionsOrder, FindOptionsSelect, FindOptionsRelations } from 'typeorm';
import { PaginatedResponseDto } from './paginated-response.dto';
import { PaginationDto } from './pagination.dto';
export declare class PaginationService {
    private readonly entityManager;
    constructor(entityManager: EntityManager);
    /**
     * Generic pagination method for any TypeORM entity
     * @param entityClass - The entity class
     * @param paginationDto - Pagination parameters (page, limit)
     * @param options - TypeORM query options (where, order, relations, select)
     * @returns Paginated response with data and metadata
     */
    paginate<T extends ObjectLiteral>(entityClass: new () => T, paginationDto: PaginationDto, options?: {
        where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
        order?: FindOptionsOrder<T>;
        relations?: FindOptionsRelations<T>;
        select?: FindOptionsSelect<T>;
    }): Promise<PaginatedResponseDto<T>>;
}
//# sourceMappingURL=pagination.service.d.ts.map