import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ShiftTemplateRepository } from '@backend/shared-domain';
import { CreateShiftTemplateDto, UpdateShiftTemplateDto } from '@backend/shared-domain';
import { ShiftTemplate, ShiftType } from '@backend/shared-domain';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';

@Injectable()
export class ShiftTemplateService {
  constructor(private readonly shiftTemplateRepository: ShiftTemplateRepository) {}

  async create(createDto: CreateShiftTemplateDto): Promise<ShiftTemplate> {
    try {
      const template = this.shiftTemplateRepository.create(createDto);
      return await this.shiftTemplateRepository.save(template);
    } catch (error) {
      throw new BadRequestException('Failed to create shift template');
    }
  }

  async findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<ShiftTemplate>> {
    try {
      const result = await this.shiftTemplateRepository.findWithPagination(paginationDto);
      return {
        data: result.templates,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch shift templates');
    }
  }

  async findOne(id: string): Promise<ShiftTemplate> {
    try {
      const template = await this.shiftTemplateRepository.findOne({
        where: { shift_template_id: id }
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

  async update(id: string, updateDto: UpdateShiftTemplateDto): Promise<ShiftTemplate> {
    try {
      const template = await this.findOne(id);
      
      Object.assign(template, updateDto);
      return await this.shiftTemplateRepository.save(template);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update shift template');
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const template = await this.findOne(id);
      await this.shiftTemplateRepository.remove(template);
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
      throw new BadRequestException('Failed to fetch shift template statistics');
    }
  }
}
