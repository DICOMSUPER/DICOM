import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RepositoryPaginationDto } from '@backend/database';
import { ShiftTemplate, ShiftType } from '../entities/schedule/shift-templates.entity';

@Injectable()
export class ShiftTemplateRepository extends BaseRepository<ShiftTemplate> {
  constructor(entityManager: EntityManager) {
    super(ShiftTemplate, entityManager);
  }

  async findByType(shiftType: ShiftType): Promise<ShiftTemplate[]> {
    return await this.findAll(
      { 
        where: { shift_type: shiftType, is_active: true },
        order: { start_time: 'ASC' }
      }
    );
  }

  async findActiveTemplates(): Promise<ShiftTemplate[]> {
    return await this.findAll(
      { 
        where: { is_active: true },
        order: { shift_type: 'ASC', start_time: 'ASC' }
      }
    );
  }

  async findWithPagination(paginationDto: RepositoryPaginationDto): Promise<{
    templates: ShiftTemplate[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const result = await this.paginate(paginationDto, {}, this.entityManager);
    
    return {
      templates: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  async getTemplateStats(): Promise<{
    totalTemplates: number;
    templatesByType: Record<string, number>;
    activeTemplates: number;
  }> {
    const totalTemplates = await this.getRepository().count();

    const templatesByType = await this.getRepository()
      .createQueryBuilder('template')
      .select('template.shift_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('template.shift_type')
      .getRawMany();

    const typeCounts = templatesByType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    const activeTemplates = await this.getRepository()
      .count({ where: { is_active: true } });

    return {
      totalTemplates,
      templatesByType: typeCounts,
      activeTemplates
    };
  }
}
