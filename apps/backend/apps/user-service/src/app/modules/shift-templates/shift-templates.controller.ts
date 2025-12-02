import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShiftTemplateService } from './shift-templates.service';
import { CreateShiftTemplateDto, UpdateShiftTemplateDto } from '@backend/shared-domain';
import { ShiftType } from '@backend/shared-enums';
import { RepositoryPaginationDto } from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller('shift-templates')
export class ShiftTemplateController {
  constructor(private readonly shiftTemplateService: ShiftTemplateService) {}

  @Post()
  @MessagePattern('UserService.ShiftTemplate.Create')
  async create(
    @Payload()
    createDto: CreateShiftTemplateDto
  ) {
    try {
      return await this.shiftTemplateService.create(createDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create shift template',
        'ShiftTemplateController'
      );
    }
  }

  @Get()
  @MessagePattern('UserService.ShiftTemplate.FindMany')
  async findMany(@Payload() data: { paginationDto: RepositoryPaginationDto & { includeInactive?: boolean; includeDeleted?: boolean } }) {
    try {
      return await this.shiftTemplateService.findMany(data.paginationDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch shift templates',
        'ShiftTemplateController'
      );
    }
  }

  @Get(':id')
  @MessagePattern('UserService.ShiftTemplate.FindOne')
  async findOne(@Payload() data: { id: string }) {
    try {
      return await this.shiftTemplateService.findOne(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch shift template',
        'ShiftTemplateController'
      );
    }
  }

  @Patch(':id')
  @MessagePattern('UserService.ShiftTemplate.Update')
  async update(
    @Payload() data: { id: string; updateDto: UpdateShiftTemplateDto }
  ) {
    try {
      return await this.shiftTemplateService.update(data.id, data.updateDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to update shift template',
        'ShiftTemplateController'
      );
    }
  }

  @Delete(':id')
  @MessagePattern('UserService.ShiftTemplate.Delete')
  async remove(@Payload() data: { id: string }) {
    try {
      return await this.shiftTemplateService.remove(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to delete shift template',
        'ShiftTemplateController'
      );
    }
  }

  @Get('type/:shiftType')
  @MessagePattern('UserService.ShiftTemplate.FindByType')
  async findByType(@Payload() data: { shiftType: ShiftType }) {
    try {
      return await this.shiftTemplateService.findByType(data.shiftType);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch shift templates by type',
        'ShiftTemplateController'
      );
    }
  }

  @Get('active')
  @MessagePattern('UserService.ShiftTemplate.FindActive')
  async findActive() {
    try {
      return await this.shiftTemplateService.findActiveTemplates();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch active shift templates',
        'ShiftTemplateController'
      );
    }
  }

  @Get('stats')
  @MessagePattern('UserService.ShiftTemplate.GetStats')
  async getStats() {
    try {
      return await this.shiftTemplateService.getStats();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch shift template statistics',
        'ShiftTemplateController'
      );
    }
  }

  // Template Operations
  @Post('duplicate/:id')
  @MessagePattern('UserService.ShiftTemplate.Duplicate')
  async duplicateTemplate(@Payload() data: { id: string; newName: string }) {
    try {
      return await this.shiftTemplateService.duplicateTemplate(
        data.id,
        data.newName
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to duplicate shift template',
        'ShiftTemplateController'
      );
    }
  }

  @Post('create-from-template')
  @MessagePattern('UserService.ShiftTemplate.CreateFromTemplate')
  async createFromTemplate(
    @Payload()
    data: {
      templateId: string;
      dates: string[];
      employeeIds: string[];
    }
  ) {
    try {
      return await this.shiftTemplateService.createFromTemplate(
        data.templateId,
        data.dates,
        data.employeeIds
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create schedules from template',
        'ShiftTemplateController'
      );
    }
  }

  @Post('apply-to-employees')
  @MessagePattern('UserService.ShiftTemplate.ApplyToEmployees')
  async applyToMultipleEmployees(
    @Payload()
    data: {
      templateId: string;
      employeeIds: string[];
      startDate: string;
      endDate: string;
    }
  ) {
    try {
      return await this.shiftTemplateService.applyToMultipleEmployees(
        data.templateId,
        data.employeeIds,
        data.startDate,
        data.endDate
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to apply template to multiple employees',
        'ShiftTemplateController'
      );
    }
  }
}
