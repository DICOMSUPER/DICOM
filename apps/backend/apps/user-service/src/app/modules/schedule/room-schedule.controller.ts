import { Controller, Get, Post, Patch, Delete, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  CreateRoomScheduleDto,
  UpdateRoomScheduleDto,
  RoomScheduleSearchFilters,
  RoomSchedule,
} from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Roles, ScheduleStatus } from '@backend/shared-enums';
import moment from 'moment';
import { RoomScheduleService } from './room-schedule.service';

@Controller('room-schedules')
export class RoomScheduleController {
  constructor(
    private readonly RoomScheduleService: RoomScheduleService
  ) {}

  @Post()
  @MessagePattern('UserService.RoomSchedule.Create')
  async create(@Payload() createDto: CreateRoomScheduleDto) {
    try {
      return await this.RoomScheduleService.create(createDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create employee schedule',
        'RoomScheduleController'
      );
    }
  }

  @Get()
  @MessagePattern('UserService.RoomSchedule.FindMany')
  async findMany(@Payload() data: { paginationDto: RepositoryPaginationDto }) {
    try {
      return await this.RoomScheduleService.findMany(data.paginationDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch employee schedules',
        'RoomScheduleController'
      );
    }
  }

  @MessagePattern('UserService.RoomSchedule.FindAll')
  async findAll(@Payload() data?: { filters?: RoomScheduleSearchFilters | any }) {
    try {
      const filters = data?.filters || {};
      const transformedFilters: RoomScheduleSearchFilters = {
        employeeId: filters.employeeId || filters.employee_id,
        roomId: filters.roomId || filters.room_id,
        workDateFrom: filters.workDateFrom || filters.work_date_from || filters.start_date,
        workDateTo: filters.workDateTo || filters.work_date_to || filters.end_date,
        startTime: filters.startTime || filters.start_time,
        endTime: filters.endTime || filters.end_time,
        scheduleStatus: filters.scheduleStatus || filters.schedule_status,
        role: filters.role,
        sortBy: filters.sortBy || filters.sort_by,
        sortOrder: filters.sortOrder || filters.sort_order,
        limit: filters.limit,
        offset: filters.offset,
      };
      
      // Remove undefined values
      Object.keys(transformedFilters).forEach(key => {
        if (transformedFilters[key] === undefined) {
          delete transformedFilters[key];
        }
      });
      
      return await this.RoomScheduleService.findAll(transformedFilters);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch all employee schedules',
        'RoomScheduleController'
      );
    }
  }

  @Get(':id')
  @MessagePattern('UserService.RoomSchedule.FindOne')
  async findOne(@Payload() data: { id: string }) {
    try {
      return await this.RoomScheduleService.findOne(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch employee schedule',
        'RoomScheduleController'
      );
    }
  }

  @Patch(':id')
  @MessagePattern('UserService.RoomSchedule.Update')
  async update(
    @Payload() data: { id: string; updateDto: UpdateRoomScheduleDto }
  ) {
    try {
      return await this.RoomScheduleService.update(data.id, data.updateDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to update employee schedule',
        'RoomScheduleController'
      );
    }
  }

  @Delete(':id')
  @MessagePattern('UserService.RoomSchedule.Delete')
  async remove(@Payload() data: { id: string }) {
    try {
      return await this.RoomScheduleService.remove(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to delete employee schedule',
        'RoomScheduleController'
      );
    }
  }

  @Get('me')
  @MessagePattern('UserService.RoomSchedule.FindByCurrentUser')
  async findByCurrentUser(
    @Payload()
    data: {
      userId: string;
      limit?: number;
      start_date?: string;
      end_date?: string;
    }
  ) {
    try {
      return await this.RoomScheduleService.findByCurrentUser(
        data.userId,
        data.limit,
        data.start_date,
        data.end_date
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch current user schedules',
        'RoomScheduleController'
      );
    }
  }

  @Get('filters')
  @MessagePattern('UserService.RoomSchedule.FindWithFilters')
  async findWithFilters(
    @Payload() data: { filters: RoomScheduleSearchFilters }
  ) {
    try {
      return await this.RoomScheduleService.findWithFilters(data.filters);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch schedules with filters',
        'RoomScheduleController'
      );
    }
  }

  @Get('stats')
  @MessagePattern('UserService.RoomSchedule.GetStats')
  async getStats(@Payload() data: { employeeId?: string }) {
    try {
      return await this.RoomScheduleService.getStats(data.employeeId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to fetch schedule statistics',
        'RoomScheduleController'
      );
    }
  }

  // Bulk Operations
  @Post('bulk')
  @MessagePattern('UserService.RoomSchedule.CreateBulk')
  async createBulk(
    @Payload() data: { schedules: CreateRoomScheduleDto[] }
  ) {
    try {
      return await this.RoomScheduleService.createBulk(data.schedules);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create bulk schedules',
        'RoomScheduleController'
      );
    }
  }

  @Patch('bulk')
  @MessagePattern('UserService.RoomSchedule.UpdateBulk')
  async updateBulk(
    @Payload()
    data: {
      updates: { id: string; data: UpdateRoomScheduleDto }[];
    }
  ) {
    try {
      return await this.RoomScheduleService.updateBulk(data.updates);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to update bulk schedules',
        'RoomScheduleController'
      );
    }
  }

  @Delete('bulk')
  @MessagePattern('UserService.RoomSchedule.DeleteBulk')
  async deleteBulk(@Payload() data: { ids: string[] }) {
    try {
      return await this.RoomScheduleService.deleteBulk(data.ids);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to delete bulk schedules',
        'RoomScheduleController'
      );
    }
  }

  @Post('copy-week')
  @MessagePattern('UserService.RoomSchedule.CopyWeek')
  async copyWeek(
    @Payload()
    data: {
      sourceWeekStart: string;
      targetWeekStart: string;
      employeeId?: string;
    }
  ) {
    try {
      return await this.RoomScheduleService.copyWeek(
        data.sourceWeekStart,
        data.targetWeekStart,
        data.employeeId
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to copy week schedules',
        'RoomScheduleController'
      );
    }
  }

  @Post('check-conflict')
  @MessagePattern('UserService.RoomSchedule.CheckConflict')
  async checkConflict(
    @Payload()
    data: {
      employeeId: string;
      date: string;
      startTime: string;
      endTime: string;
      excludeScheduleId?: string;
    }
  ) {
    try {
      return await this.RoomScheduleService.checkConflict(
        data.employeeId,
        data.date,
        data.startTime,
        data.endTime,
        data.excludeScheduleId
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to check schedule conflict',
        'RoomScheduleController'
      );
    }
  }

  @Post('validate-working-hours')
  @MessagePattern('UserService.RoomSchedule.ValidateWorkingHours')
  async validateAgainstWorkingHours(
    @Payload() data: { schedules: RoomSchedule[] }
  ) {
    try {
      return await this.RoomScheduleService.validateAgainstWorkingHours(
        data.schedules
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to validate schedules against working hours',
        'RoomScheduleController'
      );
    }
  }

  @MessagePattern('UserService.RoomSchedule.GetOverlappingSchedule')
  async getOverlappingSchedules(@Payload() data: { id: string; role: Roles }) {
    return await this.RoomScheduleService.getOverlappingSchedules(
      data.id,
      data.role
    );
  }
}
