import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeScheduleService } from './employee-schedule.service';
import { CreateEmployeeScheduleDto, UpdateEmployeeScheduleDto, EmployeeScheduleSearchFilters, EmployeeSchedule } from '@backend/shared-domain';
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

  @Get('me')
  @MessagePattern('UserService.EmployeeSchedule.FindByCurrentUser')
  async findByCurrentUser(@Payload() data: { userId: string; limit?: number; start_date?: string; end_date?: string }) {
    try {
      return await this.employeeScheduleService.findByCurrentUser(data.userId, data.limit, data.start_date, data.end_date);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch current user schedules', 'EmployeeScheduleController');
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

  // Bulk Operations
  @Post('bulk')
  @MessagePattern('UserService.EmployeeSchedule.CreateBulk')
  async createBulk(@Payload() data: { schedules: CreateEmployeeScheduleDto[] }) {
    try {
      return await this.employeeScheduleService.createBulk(data.schedules);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to create bulk schedules', 'EmployeeScheduleController');
    }
  }

  @Patch('bulk')
  @MessagePattern('UserService.EmployeeSchedule.UpdateBulk')
  async updateBulk(@Payload() data: { updates: { id: string; data: UpdateEmployeeScheduleDto }[] }) {
    try {
      return await this.employeeScheduleService.updateBulk(data.updates);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to update bulk schedules', 'EmployeeScheduleController');
    }
  }

  @Delete('bulk')
  @MessagePattern('UserService.EmployeeSchedule.DeleteBulk')
  async deleteBulk(@Payload() data: { ids: string[] }) {
    try {
      return await this.employeeScheduleService.deleteBulk(data.ids);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to delete bulk schedules', 'EmployeeScheduleController');
    }
  }

  @Post('copy-week')
  @MessagePattern('UserService.EmployeeSchedule.CopyWeek')
  async copyWeek(@Payload() data: { sourceWeekStart: string; targetWeekStart: string; employeeId?: string }) {
    try {
      return await this.employeeScheduleService.copyWeek(data.sourceWeekStart, data.targetWeekStart, data.employeeId);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to copy week schedules', 'EmployeeScheduleController');
    }
  }

  @Post('check-conflict')
  @MessagePattern('UserService.EmployeeSchedule.CheckConflict')
  async checkConflict(@Payload() data: { employeeId: string; date: string; startTime: string; endTime: string; excludeScheduleId?: string }) {
    try {
      return await this.employeeScheduleService.checkConflict(data.employeeId, data.date, data.startTime, data.endTime, data.excludeScheduleId);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to check schedule conflict', 'EmployeeScheduleController');
    }
  }

  @Post('validate-working-hours')
  @MessagePattern('UserService.EmployeeSchedule.ValidateWorkingHours')
  async validateAgainstWorkingHours(@Payload() data: { schedules: EmployeeSchedule[] }) {
    try {
      return await this.employeeScheduleService.validateAgainstWorkingHours(data.schedules);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to validate schedules against working hours', 'EmployeeScheduleController');
    }
  }
}
