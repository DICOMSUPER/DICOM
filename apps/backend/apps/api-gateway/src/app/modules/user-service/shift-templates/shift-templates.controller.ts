import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Logger,
  UseInterceptors,
  Delete,
  Patch,
  Query,
  Req
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { handleError } from '@backend/shared-utils';
import { TransformInterceptor, RequestLoggingInterceptor } from '@backend/shared-interceptor';
import { CreateShiftTemplateDto, UpdateShiftTemplateDto } from '@backend/shared-domain';
import { Roles } from '@backend/shared-enums';
import { Public } from '@backend/shared-decorators';
import { Role } from '@backend/shared-decorators';
import type { Request } from 'express';

@ApiTags('Shift Template Management')
@Controller('shift-templates')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ShiftTemplatesController {
  private readonly logger = new Logger('ShiftTemplatesController');

  constructor(
    @Inject('USER_SERVICE') private readonly shiftTemplateClient: ClientProxy,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all shift templates' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive shift templates' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Include soft-deleted shift templates' })
  @ApiResponse({ status: 200, description: 'Shift templates retrieved successfully' })
  async getAllShiftTemplates(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('is_active') is_active?: boolean,
    @Query('includeInactive') includeInactive?: boolean,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    try {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 10;

      this.logger.log(`📋 Fetching shift templates - Page: ${pageNum}, Limit: ${limitNum}, Is Active: ${is_active}`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.FindMany', {
          paginationDto: {
            page: pageNum,
            limit: limitNum,
            search,
            includeInactive,
            includeDeleted,
          },
        }),
      );

      // Filter by is_active if provided and includeInactive is not true
      let filteredData = result.data || [];
      if (is_active !== undefined && !includeInactive) {
        filteredData = filteredData.filter((template: any) => template.is_active === (is_active === true ));
      }

      const response = {
        data: filteredData,
        total: filteredData.length,
        page: result.page || pageNum,
        totalPages: result.totalPages || 1,
        hasNextPage: result.hasNextPage || false,
        hasPreviousPage: result.hasPreviousPage || false,
      };

      this.logger.log(`✅ Retrieved ${filteredData.length} shift templates (Total: ${result.total || 0})`);

      return response;
    } catch (error) {
      this.logger.error('❌ Failed to fetch shift templates', error);
      throw handleError(error);
    }
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get all active shift templates' })
  @ApiResponse({ status: 200, description: 'Active shift templates retrieved successfully' })
  async getActiveShiftTemplates() {
    try {
      this.logger.log('📋 Fetching active shift templates');

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.FindActive', {}),
      );

      this.logger.log(`✅ Retrieved ${result?.length || 0} active shift templates`);

      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch active shift templates', error);
      throw handleError(error);
    }
  }

  @Public()
  @Get('type/:shiftType')
  @ApiOperation({ summary: 'Get shift templates by type' })
  @ApiParam({ name: 'shiftType', description: 'Shift type' })
  @ApiResponse({ status: 200, description: 'Shift templates by type retrieved successfully' })
  async getShiftTemplatesByType(@Param('shiftType') shiftType: string) {
    try {
      this.logger.log(`📋 Fetching shift templates by type: ${shiftType}`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.FindByType', { shiftType }),
      );

      this.logger.log(`✅ Retrieved ${result?.length || 0} shift templates for type: ${shiftType}`);

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch shift templates by type: ${shiftType}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Get('stats')
  @ApiOperation({ summary: 'Get shift template statistics' })
  @ApiResponse({ status: 200, description: 'Shift template stats retrieved successfully' })
  async getShiftTemplateStats() {
    try {
      this.logger.log('📊 Fetching shift template statistics');

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.GetStats', {}),
      );

      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch shift template stats', error);
      throw handleError(error);
    }
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get shift template by ID' })
  @ApiParam({ name: 'id', description: 'Shift Template ID' })
  @ApiResponse({ status: 200, description: 'Shift template retrieved successfully' })
  async getShiftTemplateById(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching shift template by ID: ${id}`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.FindOne', { id }),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get shift template by ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new shift template' })
  @ApiBody({ type: CreateShiftTemplateDto })
  @ApiResponse({ status: 201, description: 'Shift template created successfully' })
  async createShiftTemplate(@Body() createDto: CreateShiftTemplateDto,@Req() req: Request) {
    try {
      const token = req.cookies?.token; 
      this.logger.log(`🏗️ Creating shift template: ${createDto.shift_name}`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.Create', {...createDto, token}),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Shift template creation failed`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update shift template details' })
  @ApiParam({ name: 'id', description: 'Shift Template ID' })
  @ApiBody({ type: UpdateShiftTemplateDto })
  @ApiResponse({ status: 200, description: 'Shift template updated successfully' })
  async updateShiftTemplate(
    @Param('id') id: string,
    @Body() updateDto: UpdateShiftTemplateDto,
  ) {
    try {
      this.logger.log(`🛠️ Updating shift template ID: ${id}`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.Update', { id, updateDto }),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to update shift template ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete shift template' })
  @ApiParam({ name: 'id', description: 'Shift Template ID' })
  @ApiResponse({ status: 200, description: 'Shift template deleted successfully' })
  async deleteShiftTemplate(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting shift template ID: ${id}`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.Delete', { id }),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to delete shift template ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Post('duplicate/:id')
  @ApiOperation({ summary: 'Duplicate a shift template' })
  @ApiParam({ name: 'id', description: 'Shift Template ID to duplicate' })
  @ApiBody({ schema: { type: 'object', properties: { new_name: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Shift template duplicated successfully' })
  async duplicateShiftTemplate(
    @Param('id') id: string,
    @Body('new_name') newName: string,
  ) {
    try {
      this.logger.log(`📋 Duplicating shift template ID: ${id} with new name: ${newName}`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.Duplicate', { id, newName }),
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to duplicate shift template ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Post('create-from-template')
  @ApiOperation({ summary: 'Create schedules from template' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        templateId: { type: 'string' },
        dates: { type: 'array', items: { type: 'string' } },
        employeeIds: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Schedules created from template successfully' })
  async createFromTemplate(@Body() data: { templateId: string; dates: string[]; employeeIds: string[] }) {
    try {
      this.logger.log(`📅 Creating schedules from template: ${data.templateId}`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.CreateFromTemplate', data),
      );

      return result;
    } catch (error) {
      this.logger.error('❌ Failed to create schedules from template', error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Post('apply-to-employees')
  @ApiOperation({ summary: 'Apply template to multiple employees' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        templateId: { type: 'string' },
        employeeIds: { type: 'array', items: { type: 'string' } },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Template applied to employees successfully' })
  async applyToMultipleEmployees(
    @Body() data: { templateId: string; employeeIds: string[]; startDate: string; endDate: string },
  ) {
    try {
      this.logger.log(`👥 Applying template ${data.templateId} to multiple employees`);

      const result = await firstValueFrom(
        this.shiftTemplateClient.send('UserService.ShiftTemplate.ApplyToEmployees', data),
      );

      return result;
    } catch (error) {
      this.logger.error('❌ Failed to apply template to employees', error);
      throw handleError(error);
    }
  }
}

