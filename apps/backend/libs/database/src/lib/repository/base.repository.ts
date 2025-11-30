import {
  EntityManager,
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  FindOptionsWhere,
  Brackets,
  In,
} from 'typeorm';
import { PaginatedResponseDto } from '../pagination/paginated-response.dto';
import { RepositoryPaginationDto } from './repository-pagination.dto';

export class BaseRepository<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  constructor(
    protected readonly entity: new () => T,
    protected readonly entityManager: EntityManager
  ) {
    this.repository = this.entityManager.getRepository(this.entity);
  }

  protected getRepository(entityManager?: EntityManager): Repository<T> {
    return entityManager
      ? entityManager.getRepository(this.entity)
      : this.repository;
  }

  protected hasIsDeletedColumn(entityManager?: EntityManager): boolean {
    const repository = this.getRepository(entityManager);
    return !!repository.metadata.findColumnWithPropertyName('isDeleted');
  }

  protected isSoftDeleted(entity: T, entityManager?: EntityManager): boolean {
    if (!this.hasIsDeletedColumn(entityManager)) return false;
    const candidate = entity as unknown as { isDeleted?: boolean };
    return candidate.isDeleted === true;
  }

  protected withNotDeletedWhere(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined,
    entityManager?: EntityManager
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined {
    if (!this.hasIsDeletedColumn(entityManager)) return where;

    const notDeleted = { isDeleted: false } as unknown as FindOptionsWhere<T>;
    if (!where) return notDeleted;

    if (Array.isArray(where)) {
      return where.map((w) => ({
        ...(w as object),
        ...(notDeleted as object),
      })) as FindOptionsWhere<T>[];
    }
    return {
      ...(where as object),
      ...(notDeleted as object),
    } as FindOptionsWhere<T>;
  }

  //note: this method is used to find all the entities in the database
  async findAll(
    options?: FindManyOptions<T>,
    relations?: string[],
    entityManager?: EntityManager
  ): Promise<T[]> {
    const repository = this.getRepository(entityManager);
    const mergedOptions: FindManyOptions<T> = {
      ...options,
      where: this.withNotDeletedWhere(options?.where, entityManager),
      relations: relations ?? options?.relations,
    };
    return repository.find(mergedOptions);
  }

  //note: this method is used to find one entity in the database
  async findOne(
    options: FindOneOptions<T>,
    relations?: string[],
    entityManager?: EntityManager
  ): Promise<T | null> {
    const repository = this.getRepository(entityManager);
    const mergedOptions: FindOneOptions<T> = {
      ...options,
      where: this.withNotDeletedWhere(options?.where, entityManager),
      relations: relations ?? options?.relations,
    };
    return repository.findOne(mergedOptions);
  }

  //note: this method is used to find one entity by id in the database
  async findById(
    id: number | string,
    relations?: string[],
    entityManager?: EntityManager
  ): Promise<T | null> {
    const repository = this.getRepository(entityManager);
    const where = this.withNotDeletedWhere(
      {
        id,
      } as unknown as FindOptionsWhere<T>,
      entityManager
    ) as FindOptionsWhere<T>;
    return repository.findOne({
      where,
      relations,
    });
  }

  //note: this method is used to create a new entity in the database
  async create(
    data: DeepPartial<T>,
    entityManager?: EntityManager
  ): Promise<T> {
    const repository = this.getRepository(entityManager);
    const entity = repository.create(data);
    return repository.save(entity);
  }

  //note: this method is used to update an entity in the database
  async update(
    id: number | string,
    data: DeepPartial<T>,
    entityManager?: EntityManager
  ): Promise<T | null> {
    const repository = this.getRepository(entityManager);
    const entity = await this.findById(id, [], entityManager);
    if (!entity) return null;

    // Prevent updating soft-deleted entities
    if (this.isSoftDeleted(entity, entityManager)) {
      return null;
    }

    const merged = repository.merge(entity, data);
    return repository.save(merged);
  }

  //note: this method is used to delete an entity in the database
  async delete(
    id: number | string,
    entityManager?: EntityManager
  ): Promise<boolean> {
    const repository = this.getRepository(entityManager);
    const result = await repository.delete(id);
    return result.affected !== 0;
  }

  //note: this method is used to soft delete an entity in the database
  async softDelete(
    id: number | string,
    softDeleteField: keyof T | 'isDeleted',
    entityManager?: EntityManager
  ): Promise<boolean> {
    const repository = this.getRepository(entityManager);
    const entity = await this.findById(id, [], entityManager);
    if (!entity) return false;

    const hasIsActiveColumn = !!repository.metadata.findColumnWithPropertyName('isActive');
    
    const updateData: DeepPartial<T> = {
      [softDeleteField]: true as unknown as T[keyof T],
    } as DeepPartial<T>;

    if (hasIsActiveColumn) {
      (updateData as any).isActive = false;
    }

    const merged = repository.merge(entity, updateData);
    await repository.save(merged);
    return true;
  }

  //note: this method is used to paginate the entities in the database
  async paginate(
    paginationDto: RepositoryPaginationDto,
    options?: FindManyOptions<T>,
    entityManager?: EntityManager
  ): Promise<PaginatedResponseDto<T>> {
    const repository = this.getRepository(entityManager);

    const {
      page = 1,
      limit = 10,
      sortField,
      order,
      sortFields,
      sortOrders,
      sortFieldsString,
      sortOrdersString,
      relation,
      searchField,
      search,
    } = paginationDto;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    const query = repository.createQueryBuilder('entity');

    const relationsFromDto = relation?.length ? relation : undefined;
    let relationsFromOptions: string[] | undefined = undefined;
    if (options?.relations) {
      const relationsValue = options.relations as any;
      if (Array.isArray(relationsValue) && relationsValue.length > 0) {
        if (typeof relationsValue[0] === 'string') {
          relationsFromOptions = relationsValue as string[];
        }
      }
    }
    
    const relationsToJoin = relationsFromDto || relationsFromOptions;
    
    if (relationsToJoin?.length) {
      relationsToJoin.forEach((r: string) => {
        const parts = r.split('.');
        let parentAlias = 'entity';
        let currentPath = '';

        for (const part of parts) {
          currentPath = `${parentAlias}.${part}`;
          const alias = `${parentAlias}_${part}`;

          const alreadyJoined = query.expressionMap.joinAttributes.some(
            (join) => join.alias.name === alias
          );

          if (!alreadyJoined) {
            query.leftJoinAndSelect(currentPath, alias);
          }

          parentAlias = alias;
        }
      });
    }

    // Apply where conditions from options
    if (options?.where) {
      query.andWhere(
        new Brackets((qb) => {
          if (typeof options.where === 'object') {
            Object.entries(options.where).forEach(([key, value]) => {
              qb.andWhere(`entity.${key} = :${key}`, { [key]: value });
            });
          }
        })
      );
    }

    // Search filter
    if (search && searchField) {
      query.andWhere(`entity.${searchField} LIKE :search`, {
        search: `%${search}%`,
      });
    }

    // Sorting - support multiple sort fields (n fields)
    // Priority: sortFields/sortOrders arrays > sortFieldsString/sortOrdersString > sortField/order > options.order
    
    // Handle multiple sort fields (arrays)
    if (sortFields && sortFields.length > 0 && sortOrders && sortOrders.length > 0) {
      const minLength = Math.min(sortFields.length, sortOrders.length);
      for (let i = 0; i < minLength; i++) {
        if (sortFields[i] && sortOrders[i]) {
          if (i === 0) {
            query.orderBy(
              `entity.${sortFields[i]}`,
              sortOrders[i].toUpperCase() as 'ASC' | 'DESC'
            );
          } else {
            query.addOrderBy(
              `entity.${sortFields[i]}`,
              sortOrders[i].toUpperCase() as 'ASC' | 'DESC'
            );
          }
        }
      }
    }
    // Handle comma-separated format
    else if (sortFieldsString && sortOrdersString) {
      const fields = sortFieldsString.split(',').map(f => f.trim()).filter(f => f);
      const orders = sortOrdersString.split(',').map(o => o.trim()).filter(o => o);
      const minLength = Math.min(fields.length, orders.length);
      for (let i = 0; i < minLength; i++) {
        if (fields[i] && orders[i]) {
          if (i === 0) {
            query.orderBy(
              `entity.${fields[i]}`,
              orders[i].toUpperCase() as 'ASC' | 'DESC'
            );
          } else {
            query.addOrderBy(
              `entity.${fields[i]}`,
              orders[i].toUpperCase() as 'ASC' | 'DESC'
            );
          }
        }
      }
    }
    // Handle single sort field (backward compatibility)
    else if (sortField && order) {
      query.orderBy(
        `entity.${sortField}`,
        order.toUpperCase() as 'ASC' | 'DESC'
      );
    } else if (options?.order) {
      // Apply order from options if no paginationDto order
      Object.entries(options.order).forEach(([key, value]) => {
        query.addOrderBy(`entity.${key}`, value as 'ASC' | 'DESC');
      });
    }

    // Exclude soft-deleted
    if (this.hasIsDeletedColumn(entityManager)) {
      query.andWhere('entity.isDeleted = :isDeleted', { isDeleted: false });
    }

    query.skip(skip).take(safeLimit);

    const [data, total] = await query.getManyAndCount();

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

  //note: this method is used to batch delete multiple entities by IDs
  async batchDelete(
    ids: (number | string)[],
    entityManager?: EntityManager
  ): Promise<number> {
    if (!ids.length) return 0;

    const repository = this.getRepository(entityManager);
    const result = await repository.delete({
      id: In(ids),
    } as unknown as FindOptionsWhere<T>);
    return result.affected || 0;
  }

  //note: this method is used to batch soft delete multiple entities by IDs
  async batchSoftDelete(
    ids: (number | string)[],
    softDeleteField: keyof T | 'isDeleted',
    entityManager?: EntityManager
  ): Promise<number> {
    if (!ids.length) return 0;

    const repository = this.getRepository(entityManager);

    // Find all entities that exist and are not already soft-deleted
    const entities = await repository.find({
      where: this.withNotDeletedWhere(
        { id: In(ids) } as unknown as FindOptionsWhere<T>,
        entityManager
      ) as FindOptionsWhere<T>,
    });

    if (!entities.length) return 0;

    // Update all entities with soft delete flag
    const updatedEntities = entities.map((entity) =>
      repository.merge(entity, {
        [softDeleteField]: true as unknown as T[keyof T],
      } as DeepPartial<T>)
    );

    await repository.save(updatedEntities);
    return updatedEntities.length;
  }

  //note: this method is used to batch update multiple entities by IDs
  async batchUpdate(
    ids: (number | string)[],
    data: DeepPartial<T>,
    entityManager?: EntityManager
  ): Promise<T[]> {
    if (!ids.length) return [];

    const repository = this.getRepository(entityManager);

    // Find all entities that exist and are not soft-deleted
    const entities = await repository.find({
      where: this.withNotDeletedWhere(
        { id: In(ids) } as unknown as FindOptionsWhere<T>,
        entityManager
      ) as FindOptionsWhere<T>,
    });

    if (!entities.length) return [];

    // Merge data with each entity
    const updatedEntities = entities.map((entity) =>
      repository.merge(entity, data)
    );

    await repository.save(updatedEntities);

    const updatedEntitiesAfter = await repository.find({
      where: this.withNotDeletedWhere(
        { id: In(ids) } as unknown as FindOptionsWhere<T>,
        entityManager
      ) as FindOptionsWhere<T>,
    });
    return updatedEntitiesAfter;
  }
}
