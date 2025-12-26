import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { ShiftTemplate } from '../entities/users/shift-templates.entity';
import { ShiftType } from '@backend/shared-enums';
import {
  RepositoryPaginationDto,
} from '@backend/database';

@Injectable()
export class ShiftTemplateRepository extends BaseRepository<ShiftTemplate> {
  constructor(
    entityManager: EntityManager,
  ) {
    super(ShiftTemplate, entityManager);
  }


  override async findOne(options: any): Promise<ShiftTemplate | null> {
    return this.repository.findOne(options);
  }

  async find(options: any): Promise<ShiftTemplate[]> {
    return this.repository.find(options);
  }

  async remove(template: ShiftTemplate): Promise<ShiftTemplate> {
    return this.repository.remove(template);
  }

  async findByType(shiftType: ShiftType): Promise<ShiftTemplate[]> {
    return this.repository.find({
      where: { shift_type: shiftType },
      order: { shift_name: 'ASC' },
    });
  }

  async findActiveTemplates(): Promise<ShiftTemplate[]> {
    return this.repository.find({
      where: { is_active: true },
      order: { shift_name: 'ASC' },
    });
  }

  async findWithPagination(
    paginationDto: RepositoryPaginationDto & { shift_type?: string },
    includeInactive?: boolean,
    includeDeleted?: boolean
  ): Promise<{
    templates: ShiftTemplate[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, shift_type, sortField, order = 'ASC' } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('shiftTemplate');

    const whereConditions: string[] = [];
    const whereParams: any = {};

    if (!includeDeleted) {
      whereConditions.push('shiftTemplate.isDeleted = :isDeleted');
      whereParams.isDeleted = false;
    }

    if (!includeInactive) {
      whereConditions.push('shiftTemplate.is_active = :isActive');
      whereParams.isActive = true;
    }

    if (shift_type) {
      whereConditions.push('shiftTemplate.shift_type = :shiftType');
      whereParams.shiftType = shift_type;
    }

    if (whereConditions.length > 0) {
      queryBuilder.where(whereConditions.join(' AND '), whereParams);
    }

    if (search) {
      queryBuilder.andWhere(
        'unaccent(LOWER(shiftTemplate.shift_name)) ILIKE unaccent(LOWER(:search)) OR unaccent(LOWER(shiftTemplate.description)) ILIKE unaccent(LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (sortField) {
      queryBuilder.orderBy(`shiftTemplate.${sortField}`, order as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('shiftTemplate.shift_name', 'ASC');
    }

    const [templates, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      templates,
      total,
      page,
      totalPages,
    };
  }

  async getTemplateStats(): Promise<any> {
    const totalTemplates = await this.repository.count();
    const activeTemplates = await this.repository.count({
      where: { is_active: true },
    });

    const templatesByType = await this.repository
      .createQueryBuilder('template')
      .select('template.shift_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('template.shift_type')
      .getRawMany();

    return {
      totalTemplates,
      activeTemplates,
      inactiveTemplates: totalTemplates - activeTemplates,
      templatesByType,
    };
  }
}
