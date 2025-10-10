import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EmployeeScheduleRepository } from '@backend/shared-domain';
import { CreateEmployeeScheduleDto, UpdateEmployeeScheduleDto, EmployeeScheduleSearchFilters } from '@backend/shared-domain';
import { EmployeeSchedule, ScheduleStatus } from '@backend/shared-domain';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';

@Injectable()
export class EmployeeScheduleService {
  constructor(private readonly employeeScheduleRepository: EmployeeScheduleRepository) {}

  async create(createDto: CreateEmployeeScheduleDto): Promise<EmployeeSchedule> {
    try {
      // Check for schedule conflicts
      const existingSchedule = await this.employeeScheduleRepository.findByEmployeeId(
        createDto.employee_id
      );
      
      const conflictExists = existingSchedule.some(schedule => 
        schedule.work_date === createDto.work_date &&
        schedule.schedule_status !== ScheduleStatus.CANCELLED
      );

      if (conflictExists) {
        throw new BadRequestException('Employee already has a schedule for this date');
      }

      const schedule = this.employeeScheduleRepository.create(createDto);
      return await this.employeeScheduleRepository.save(schedule);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create employee schedule');
    }
  }

  async findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<EmployeeSchedule>> {
    try {
      const result = await this.employeeScheduleRepository.findWithPagination(paginationDto);
      return {
        data: result.schedules,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch employee schedules');
    }
  }

  async findOne(id: string): Promise<EmployeeSchedule> {
    try {
      const schedule = await this.employeeScheduleRepository.findOne({
        where: { schedule_id: id }
      }, ['employee', 'room', 'shift_template']);

      if (!schedule) {
        throw new NotFoundException('Employee schedule not found');
      }

      return schedule;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch employee schedule');
    }
  }

  async update(id: string, updateDto: UpdateEmployeeScheduleDto): Promise<EmployeeSchedule> {
    try {
      const schedule = await this.findOne(id);
      
      Object.assign(schedule, updateDto);
      return await this.employeeScheduleRepository.save(schedule);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update employee schedule');
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const schedule = await this.findOne(id);
      await this.employeeScheduleRepository.remove(schedule);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete employee schedule');
    }
  }

  async findByEmployeeId(employeeId: string, limit?: number): Promise<EmployeeSchedule[]> {
    try {
      return await this.employeeScheduleRepository.findByEmployeeId(employeeId, limit);
    } catch (error) {
      throw new BadRequestException('Failed to fetch employee schedules');
    }
  }

  async findByDateRange(
    startDate: string, 
    endDate: string, 
    employeeId?: string
  ): Promise<EmployeeSchedule[]> {
    try {
      return await this.employeeScheduleRepository.findByDateRange(startDate, endDate, employeeId);
    } catch (error) {
      throw new BadRequestException('Failed to fetch schedules by date range');
    }
  }

  async findByRoomAndDate(roomId: string, workDate: string): Promise<EmployeeSchedule[]> {
    try {
      return await this.employeeScheduleRepository.findByRoomAndDate(roomId, workDate);
    } catch (error) {
      throw new BadRequestException('Failed to fetch room schedules');
    }
  }

  async findWithFilters(filters: EmployeeScheduleSearchFilters): Promise<EmployeeSchedule[]> {
    try {
      return await this.employeeScheduleRepository.findWithFilters(filters);
    } catch (error) {
      throw new BadRequestException('Failed to fetch schedules with filters');
    }
  }

  async getStats(employeeId?: string): Promise<any> {
    try {
      return await this.employeeScheduleRepository.getScheduleStats(employeeId);
    } catch (error) {
      throw new BadRequestException('Failed to fetch schedule statistics');
    }
  }
}
