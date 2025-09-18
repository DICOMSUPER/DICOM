import {
  EntityManager,
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  FindOptionsWhere,
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

  private hasIsDeletedColumn(): boolean {
    return !!this.repository.metadata.findColumnWithPropertyName('isDeleted');
  }

  private isSoftDeleted(entity: T): boolean {
    if (!this.hasIsDeletedColumn()) return false;
    const candidate = entity as unknown as { isDeleted?: boolean };
    return candidate.isDeleted === true;
  }

  private withNotDeletedWhere(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined {
    if (!this.hasIsDeletedColumn()) return where;

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
    relations?: string[]
  ): Promise<T[]> {
    const mergedOptions: FindManyOptions<T> = {
      ...options,
      where: this.withNotDeletedWhere(options?.where),
      relations: relations ?? options?.relations,
    };
    return this.repository.find(mergedOptions);
  }

  //note: this method is used to find one entity in the database
  async findOne(
    options: FindOneOptions<T>,
    relations?: string[]
  ): Promise<T | null> {
    const mergedOptions: FindOneOptions<T> = {
      ...options,
      where: this.withNotDeletedWhere(options?.where),
      relations: relations ?? options?.relations,
    };
    return this.repository.findOne(mergedOptions);
  }

  //note: this method is used to find one entity by id in the database
  async findById(id: number | string, relations?: string[]): Promise<T | null> {
    const where = this.withNotDeletedWhere({
      id,
    } as unknown as FindOptionsWhere<T>) as FindOptionsWhere<T>;
    return this.repository.findOne({
      where,
      relations,
    });
  }

  //note: this method is used to create a new entity in the database
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  //note: this method is used to update an entity in the database
  async update(id: number | string, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findById(id);
    if (!entity) return null;

    // Prevent updating soft-deleted entities
    if (this.isSoftDeleted(entity)) {
      return null;
    }

    const merged = this.repository.merge(entity, data);
    return this.repository.save(merged);
  }

  //note: this method is used to delete an entity in the database
  async delete(id: number | string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  //note: this method is used to soft delete an entity in the database
  async softDelete(
    id: number | string,
    softDeleteField: keyof T | 'isDeleted'
  ): Promise<boolean> {
    const entity = await this.findById(id);
    if (!entity) return false;

    const merged = this.repository.merge(entity, {
      [softDeleteField]: true as unknown as T[keyof T],
    } as DeepPartial<T>);

    await this.repository.save(merged);
    return true;
  }

  //note: this method is used to paginate the entities in the database
  async paginate(
    paginationDto: RepositoryPaginationDto,
    _options?: FindManyOptions<T>
  ): Promise<PaginatedResponseDto<T>> {
    void _options; // intentionally unused for now
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

    const query = this.repository.createQueryBuilder('entity');

    // 🔎 Search filter
    if (search && searchField) {
      query.andWhere(`entity.${searchField} LIKE :search`, {
        search: `%${search}%`,
      });
    }

    // 🔗 Relations
    if (relation?.length) {
      relation.forEach((r) => query.leftJoinAndSelect(`entity.${r}`, r));
    }

    // ↕️ Sorting
    if (sortField && order) {
      query.orderBy(
        `entity.${sortField}`,
        order.toUpperCase() as 'ASC' | 'DESC'
      );
    }

    // 🚫 Exclude soft-deleted
    if (this.hasIsDeletedColumn()) {
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
}
