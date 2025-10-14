import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { WeeklySchedulePattern } from '../entities/users/weekly-schedule-patterns.entity';
import { DayOfWeek } from '@backend/shared-enums';
import {
  RepositoryPaginationDto,
} from '@backend/database';

@Injectable()
export class WeeklySchedulePatternRepository extends BaseRepository<WeeklySchedulePattern> {
  constructor(
    entityManager: EntityManager,
  ) {
    super(WeeklySchedulePattern, entityManager);
  }


  override async findOne(options: any): Promise<WeeklySchedulePattern | null> {
    return this.repository.findOne(options);
  }

  async find(options: any): Promise<WeeklySchedulePattern[]> {
    return this.repository.find(options);
  }

  async remove(pattern: WeeklySchedulePattern): Promise<WeeklySchedulePattern> {
    return this.repository.remove(pattern);
  }

  async findWithPagination(
    paginationDto: RepositoryPaginationDto
  ): Promise<{
    patterns: WeeklySchedulePattern[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, sortField, order = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('pattern');

    if (search) {
      queryBuilder.where(
        'pattern.notes ILIKE :search',
        { search: `%${search}%` }
      );
    }

    if (sortField) {
      queryBuilder.orderBy(`pattern.${sortField}`, order as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('pattern.effectiveFrom', 'DESC');
    }

    const [patterns, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      patterns,
      total,
      page,
      totalPages,
    };
  }

  async findByUserId(userId: string): Promise<WeeklySchedulePattern[]> {
    return this.repository.find({
      where: { userId, isActive: true },
      order: { dayOfWeek: 'ASC', effectiveFrom: 'DESC' },
    });
  }

  async findByDayOfWeek(dayOfWeek: DayOfWeek): Promise<WeeklySchedulePattern[]> {
    return this.repository.find({
      where: { dayOfWeek, isActive: true },
      order: { effectiveFrom: 'DESC' },
    });
  }

  async findActivePatterns(): Promise<WeeklySchedulePattern[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { userId: 'ASC', dayOfWeek: 'ASC' },
    });
  }

  async findPatternsForDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<WeeklySchedulePattern[]> {
    return this.repository
      .createQueryBuilder('pattern')
      .where('pattern.userId = :userId', { userId })
      .andWhere('pattern.isActive = :isActive', { isActive: true })
      .andWhere(
        '(pattern.effectiveFrom <= :endDate AND (pattern.effectiveUntil IS NULL OR pattern.effectiveUntil >= :startDate))',
        { startDate, endDate }
      )
      .orderBy('pattern.dayOfWeek', 'ASC')
      .getMany();
  }
}
