import { Controller, Get, Post, Body, Patch, Param, Delete, Query, MessagePattern, Payload } from '@nestjs/common';
import { WorkingHoursService } from './working-hours.service';
import { 
  CreateWorkingHoursDto, 
  UpdateWorkingHoursDto,
  CreateBreakTimeDto,
  UpdateBreakTimeDto,
  CreateSpecialHoursDto,
  UpdateSpecialHoursDto
} from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller('working-hours')
export class WorkingHoursController {
  constructor(private readonly workingHoursService: WorkingHoursService) {}

  // Working Hours
  @Post()
  @MessagePattern('UserService.WorkingHours.Create')
  async createWorkingHours(@Payload() createDto: CreateWorkingHoursDto) {
    try {
      return await this.workingHoursService.createWorkingHours(createDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to create working hours', 'WorkingHoursController');
    }
  }

  @Get()
  @MessagePattern('UserService.WorkingHours.FindMany')
  async findWorkingHours(@Payload() data: { paginationDto: RepositoryPaginationDto }) {
    try {
      return await this.workingHoursService.findWorkingHours(data.paginationDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch working hours', 'WorkingHoursController');
    }
  }

  @Get(':id')
  @MessagePattern('UserService.WorkingHours.FindOne')
  async findWorkingHoursById(@Payload() data: { id: string }) {
    try {
      return await this.workingHoursService.findWorkingHoursById(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch working hours', 'WorkingHoursController');
    }
  }

  @Patch(':id')
  @MessagePattern('UserService.WorkingHours.Update')
  async updateWorkingHours(@Payload() data: { id: string; updateDto: UpdateWorkingHoursDto }) {
    try {
      return await this.workingHoursService.updateWorkingHours(data.id, data.updateDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to update working hours', 'WorkingHoursController');
    }
  }

  @Delete(':id')
  @MessagePattern('UserService.WorkingHours.Delete')
  async deleteWorkingHours(@Payload() data: { id: string }) {
    try {
      return await this.workingHoursService.deleteWorkingHours(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to delete working hours', 'WorkingHoursController');
    }
  }

  // Break Times
  @Post('break-times')
  @MessagePattern('UserService.WorkingHours.CreateBreakTime')
  async createBreakTime(@Payload() createDto: CreateBreakTimeDto) {
    try {
      return await this.workingHoursService.createBreakTime(createDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to create break time', 'WorkingHoursController');
    }
  }

  @Get('break-times/:workingHoursId')
  @MessagePattern('UserService.WorkingHours.FindBreakTimes')
  async findBreakTimesByWorkingHours(@Payload() data: { workingHoursId: string }) {
    try {
      return await this.workingHoursService.findBreakTimesByWorkingHours(data.workingHoursId);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch break times', 'WorkingHoursController');
    }
  }

  @Patch('break-times/:id')
  @MessagePattern('UserService.WorkingHours.UpdateBreakTime')
  async updateBreakTime(@Payload() data: { id: string; updateDto: UpdateBreakTimeDto }) {
    try {
      return await this.workingHoursService.updateBreakTime(data.id, data.updateDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to update break time', 'WorkingHoursController');
    }
  }

  @Delete('break-times/:id')
  @MessagePattern('UserService.WorkingHours.DeleteBreakTime')
  async deleteBreakTime(@Payload() data: { id: string }) {
    try {
      return await this.workingHoursService.deleteBreakTime(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to delete break time', 'WorkingHoursController');
    }
  }

  // Special Hours
  @Post('special-hours')
  @MessagePattern('UserService.WorkingHours.CreateSpecialHours')
  async createSpecialHours(@Payload() createDto: CreateSpecialHoursDto) {
    try {
      return await this.workingHoursService.createSpecialHours(createDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to create special hours', 'WorkingHoursController');
    }
  }

  @Get('special-hours')
  @MessagePattern('UserService.WorkingHours.FindSpecialHours')
  async findSpecialHours(@Payload() data: { paginationDto: RepositoryPaginationDto }) {
    try {
      return await this.workingHoursService.findSpecialHours(data.paginationDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch special hours', 'WorkingHoursController');
    }
  }

  @Get('special-hours/:id')
  @MessagePattern('UserService.WorkingHours.FindSpecialHoursById')
  async findSpecialHoursById(@Payload() data: { id: string }) {
    try {
      return await this.workingHoursService.findSpecialHoursById(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch special hours', 'WorkingHoursController');
    }
  }

  @Patch('special-hours/:id')
  @MessagePattern('UserService.WorkingHours.UpdateSpecialHours')
  async updateSpecialHours(@Payload() data: { id: string; updateDto: UpdateSpecialHoursDto }) {
    try {
      return await this.workingHoursService.updateSpecialHours(data.id, data.updateDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to update special hours', 'WorkingHoursController');
    }
  }

  @Delete('special-hours/:id')
  @MessagePattern('UserService.WorkingHours.DeleteSpecialHours')
  async deleteSpecialHours(@Payload() data: { id: string }) {
    try {
      return await this.workingHoursService.deleteSpecialHours(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to delete special hours', 'WorkingHoursController');
    }
  }

  // Utility endpoints
  @Get('check-availability')
  @MessagePattern('UserService.WorkingHours.CheckAvailability')
  async checkTimeAvailability(@Payload() data: { date: string; startTime: string; endTime: string }) {
    try {
      return await this.workingHoursService.checkTimeAvailability(data.date, data.startTime, data.endTime);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to check time availability', 'WorkingHoursController');
    }
  }

  @Get('for-date/:date')
  @MessagePattern('UserService.WorkingHours.GetForDate')
  async getWorkingHoursForDate(@Payload() data: { date: string }) {
    try {
      return await this.workingHoursService.getWorkingHoursForDate(data.date);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to get working hours for date', 'WorkingHoursController');
    }
  }
}
