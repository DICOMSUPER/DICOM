import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { ScheduleReplacement } from '../entities/users/schedule-replacements.entity';
import { ScheduleStatus } from '@backend/shared-enums';
import {
  RepositoryPaginationDto,
} from '@backend/database';

@Injectable()
export class ScheduleReplacementRepository extends BaseRepository<ScheduleReplacement> {
  constructor(
    entityManager: EntityManager,
  ) {
    super(ScheduleReplacement, entityManager);
  }


  override async findOne(options: any): Promise<ScheduleReplacement | null> {
    return this.repository.findOne(options);
  }

  async find(options: any): Promise<ScheduleReplacement[]> {
    return this.repository.find(options);
  }

  async remove(replacement: ScheduleReplacement): Promise<ScheduleReplacement> {
    return this.repository.remove(replacement);
  }

  async findWithPagination(
    paginationDto: RepositoryPaginationDto
  ): Promise<{
    replacements: ScheduleReplacement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, sortField, order = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('replacement');

    if (search) {
      queryBuilder.where(
        'replacement.notes ILIKE :search OR replacement.status ILIKE :search',
        { search: `%${search}%` }
      );
    }

    if (sortField) {
      queryBuilder.orderBy(`replacement.${sortField}`, order as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('replacement.createdAt', 'DESC');
    }

    const [replacements, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      replacements,
      total,
      page,
      totalPages,
    };
  }

  async findByEmployeeId(employeeId: string): Promise<ScheduleReplacement[]> {
    return this.repository.find({
      where: { replacement_employee_id: employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: ScheduleStatus): Promise<ScheduleReplacement[]> {
    return this.repository.find({
      where: { replacement_status: status },
      order: { createdAt: 'DESC' },
    });
  }
}
