import { Controller, Get, Post, Body, Patch, Param, Delete, Query, MessagePattern, Payload } from '@nestjs/common';
import { EmployeeScheduleService } from './employee-schedule.service';
import { CreateEmployeeScheduleDto, UpdateEmployeeScheduleDto, EmployeeScheduleSearchFilters } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller('employee-schedules')
export class EmployeeScheduleController {
  constructor(private readonly employeeScheduleService: EmployeeScheduleService) {}

  @Post()
  @MessagePattern('UserService.EmployeeSchedule.Create')
  async create(@Payload() createDto: CreateEmployeeScheduleDto) {
    try {
      return await this.employeeScheduleService.create(createDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to create employee schedule', 'EmployeeScheduleController');
    }
  }

  @Get()
  @MessagePattern('UserService.EmployeeSchedule.FindMany')
  async findMany(@Payload() data: { paginationDto: RepositoryPaginationDto }) {
    try {
      return await this.employeeScheduleService.findMany(data.paginationDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch employee schedules', 'EmployeeScheduleController');
    }
  }

  @Get(':id')
  @MessagePattern('UserService.EmployeeSchedule.FindOne')
  async findOne(@Payload() data: { id: string }) {
    try {
      return await this.employeeScheduleService.findOne(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch employee schedule', 'EmployeeScheduleController');
    }
  }

  @Patch(':id')
  @MessagePattern('UserService.EmployeeSchedule.Update')
  async update(@Payload() data: { id: string; updateDto: UpdateEmployeeScheduleDto }) {
    try {
      return await this.employeeScheduleService.update(data.id, data.updateDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to update employee schedule', 'EmployeeScheduleController');
    }
  }

  @Delete(':id')
  @MessagePattern('UserService.EmployeeSchedule.Delete')
  async remove(@Payload() data: { id: string }) {
    try {
      return await this.employeeScheduleService.remove(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to delete employee schedule', 'EmployeeScheduleController');
    }
  }

  @Get('employee/:employeeId')
  @MessagePattern('UserService.EmployeeSchedule.FindByEmployeeId')
  async findByEmployeeId(@Payload() data: { employeeId: string; limit?: number }) {
    try {
      return await this.employeeScheduleService.findByEmployeeId(data.employeeId, data.limit);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch employee schedules', 'EmployeeScheduleController');
    }
  }

  @Get('date-range')
  @MessagePattern('UserService.EmployeeSchedule.FindByDateRange')
  async findByDateRange(@Payload() data: { startDate: string; endDate: string; employeeId?: string }) {
    try {
      return await this.employeeScheduleService.findByDateRange(data.startDate, data.endDate, data.employeeId);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch schedules by date range', 'EmployeeScheduleController');
    }
  }

  @Get('room/:roomId/date/:workDate')
  @MessagePattern('UserService.EmployeeSchedule.FindByRoomAndDate')
  async findByRoomAndDate(@Payload() data: { roomId: string; workDate: string }) {
    try {
      return await this.employeeScheduleService.findByRoomAndDate(data.roomId, data.workDate);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch room schedules', 'EmployeeScheduleController');
    }
  }

  @Get('filters')
  @MessagePattern('UserService.EmployeeSchedule.FindWithFilters')
  async findWithFilters(@Payload() data: { filters: EmployeeScheduleSearchFilters }) {
    try {
      return await this.employeeScheduleService.findWithFilters(data.filters);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch schedules with filters', 'EmployeeScheduleController');
    }
  }

  @Get('stats')
  @MessagePattern('UserService.EmployeeSchedule.GetStats')
  async getStats(@Payload() data: { employeeId?: string }) {
    try {
      return await this.employeeScheduleService.getStats(data.employeeId);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch schedule statistics', 'EmployeeScheduleController');
    }
  }
}
