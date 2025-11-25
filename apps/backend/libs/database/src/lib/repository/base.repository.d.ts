import { EntityManager, Repository, DeepPartial, FindManyOptions, FindOneOptions, ObjectLiteral, FindOptionsWhere } from 'typeorm';
import { PaginatedResponseDto } from '../pagination/paginated-response.dto';
import { RepositoryPaginationDto } from './repository-pagination.dto';
export declare class BaseRepository<T extends ObjectLiteral> {
    protected readonly entity: new () => T;
    protected readonly entityManager: EntityManager;
    protected readonly repository: Repository<T>;
    constructor(entity: new () => T, entityManager: EntityManager);
    protected getRepository(entityManager?: EntityManager): Repository<T>;
    protected hasIsDeletedColumn(entityManager?: EntityManager): boolean;
    protected isSoftDeleted(entity: T, entityManager?: EntityManager): boolean;
    protected withNotDeletedWhere(where: FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined, entityManager?: EntityManager): FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined;
    findAll(options?: FindManyOptions<T>, relations?: string[], entityManager?: EntityManager): Promise<T[]>;
    findOne(options: FindOneOptions<T>, relations?: string[], entityManager?: EntityManager): Promise<T | null>;
    findById(id: number | string, relations?: string[], entityManager?: EntityManager): Promise<T | null>;
    create(data: DeepPartial<T>, entityManager?: EntityManager): Promise<T>;
    update(id: number | string, data: DeepPartial<T>, entityManager?: EntityManager): Promise<T | null>;
    delete(id: number | string, entityManager?: EntityManager): Promise<boolean>;
    softDelete(id: number | string, softDeleteField: keyof T | 'isDeleted', entityManager?: EntityManager): Promise<boolean>;
    paginate(paginationDto: RepositoryPaginationDto, options?: FindManyOptions<T>, entityManager?: EntityManager): Promise<PaginatedResponseDto<T>>;
    batchDelete(ids: (number | string)[], entityManager?: EntityManager): Promise<number>;
    batchSoftDelete(ids: (number | string)[], softDeleteField: keyof T | 'isDeleted', entityManager?: EntityManager): Promise<number>;
    batchUpdate(ids: (number | string)[], data: DeepPartial<T>, entityManager?: EntityManager): Promise<T[]>;
}
//# sourceMappingURL=base.repository.d.ts.map