import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ShiftTemplateRepository } from '@backend/shared-domain';
import {
  CreateShiftTemplateDto,
  UpdateShiftTemplateDto,
} from '@backend/shared-domain';
import { ShiftType } from '@backend/shared-enums';
import { ShiftTemplate } from '@backend/shared-domain';
import {
  RepositoryPaginationDto,
  PaginatedResponseDto,
} from '@backend/database';

@Injectable()
export class ShiftTemplateService {
  private readonly shiftTemplateRepository: ShiftTemplateRepository;

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {
    this.shiftTemplateRepository = new ShiftTemplateRepository(this.entityManager);
  }

  async create(createDto: CreateShiftTemplateDto): Promise<ShiftTemplate> {
    try {
      const template = this.entityManager.create(ShiftTemplate, createDto);
      return await this.entityManager.save(ShiftTemplate, template);
    } catch (error) {
      throw new BadRequestException('Failed to create shift template');
    }
  }

  async findMany(
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ShiftTemplate>> {
    try {
      const result = await this.shiftTemplateRepository.findWithPagination(
        paginationDto
      );
      return {
        data: result.templates,
        total: result.total,
        page: result.page,
        limit: paginationDto.limit || 10,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch shift templates');
    }
  }

  async findOne(id: string): Promise<ShiftTemplate> {
    try {
      const template = await this.shiftTemplateRepository.findOne({
        where: { shift_template_id: id },
      });

      if (!template) {
        throw new NotFoundException('Shift template not found');
      }

      return template;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch shift template');
    }
  }

  async update(
    id: string,
    updateDto: UpdateShiftTemplateDto
  ): Promise<ShiftTemplate> {
    try {
      const template = await this.findOne(id);

      Object.assign(template, updateDto);
      return await this.entityManager.save(ShiftTemplate, template);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update shift template');
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await this.findOne(id); // Check if exists
      await this.shiftTemplateRepository.remove(await this.findOne(id));
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete shift template');
    }
  }

  async findByType(shiftType: ShiftType): Promise<ShiftTemplate[]> {
    try {
      return await this.shiftTemplateRepository.findByType(shiftType);
    } catch (error) {
      throw new BadRequestException('Failed to fetch shift templates by type');
    }
  }

  async findActiveTemplates(): Promise<ShiftTemplate[]> {
    try {
      return await this.shiftTemplateRepository.findActiveTemplates();
    } catch (error) {
      throw new BadRequestException('Failed to fetch active shift templates');
    }
  }

  async getStats(): Promise<any> {
    try {
      return await this.shiftTemplateRepository.getTemplateStats();
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch shift template statistics'
      );
    }
  }

  // Template Operations
  async duplicateTemplate(
    templateId: string,
    newName: string
  ): Promise<ShiftTemplate> {
    try {
      const originalTemplate = await this.findOne(templateId);

      const duplicateData = {
        shiftName: newName,
        shiftType: originalTemplate.shift_type,
        startTime: originalTemplate.start_time,
        endTime: originalTemplate.end_time,
        breakStartTime: originalTemplate.break_start_time,
        breakEndTime: originalTemplate.break_end_time,
        description: originalTemplate.description,
        isActive: true,
      };

      const template = this.entityManager.create(ShiftTemplate, duplicateData);
      return await this.entityManager.save(ShiftTemplate, template);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to duplicate shift template');
    }
  }

  async createFromTemplate(
    templateId: string,
    dates: string[],
    employeeIds: string[]
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      await this.findOne(templateId); // Check if exists
      const errors: string[] = [];
      let success = 0;
      let failed = 0;

      // This would integrate with RoomScheduleService
      // For now, we'll return a mock response
      for (const date of dates) {
        for (const employeeId of employeeIds) {
          try {
            // Here we would call RoomScheduleService.createBulk
            // with schedules created from the template
            success++;
          } catch (error) {
            failed++;
            errors.push(
              `Failed to create schedule for employee ${employeeId} on ${date}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }

      return { success, failed, errors };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create schedules from template');
    }
  }

  async applyToMultipleEmployees(
    templateId: string,
    employeeIds: string[],
    startDate: string,
    endDate: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      await this.findOne(templateId); // Check if exists
      const errors: string[] = [];
      let success = 0;
      let failed = 0;

      // Generate dates between start and end date
      const dates = this.generateDateRange(startDate, endDate);

      for (const date of dates) {
        for (const employeeId of employeeIds) {
          try {
            // Here we would call RoomScheduleService.createBulk
            // with schedules created from the template for each date/employee
            success++;
          } catch (error) {
            failed++;
            errors.push(
              `Failed to create schedule for employee ${employeeId} on ${date}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }

      return { success, failed, errors };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to apply template to multiple employees'
      );
    }
  }

  private generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }
}
