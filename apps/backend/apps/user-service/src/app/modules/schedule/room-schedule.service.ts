import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RoomScheduleRepository } from '@backend/shared-domain';
import {
  CreateRoomScheduleDto,
  UpdateRoomScheduleDto,
  RoomScheduleSearchFilters,
} from '@backend/shared-domain';
import { RoomSchedule } from '@backend/shared-domain';
import { Roles, ScheduleStatus } from '@backend/shared-enums';
import {
  RepositoryPaginationDto,
  PaginatedResponseDto,
} from '@backend/database';

@Injectable()
export class RoomScheduleService {
  constructor(
    private readonly RoomScheduleRepository: RoomScheduleRepository
  ) {}

  async create(
    createDto: CreateRoomScheduleDto
  ): Promise<RoomSchedule> {
    try {
      // Force default status to SCHEDULED regardless of payload
      createDto.schedule_status = ScheduleStatus.SCHEDULED;

      // Validate work_date is at least 1 day in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const scheduleDate = new Date(createDto.work_date);
      scheduleDate.setHours(0, 0, 0, 0);
      
      const diffTime = scheduleDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        throw new BadRequestException(
          'Schedule must be created at least 1 day in advance. Cannot schedule for today or in the past.'
        );
      }

      // Validate that start_time and end_time are provided when creating new schedule
      // Unless shift_template_id is provided (which will provide the times)
      if (!createDto.shift_template_id) {
        if (!createDto.actual_start_time || !createDto.actual_end_time) {
          throw new BadRequestException(
            'Start time and end time are required when creating a new schedule without a shift template.'
          );
        }

        // Validate start time is before end time (handle overnight shifts)
        const parseTime = (timeStr: string) => {
          const parts = timeStr.split(':');
          return parseInt(parts[0]) * 60 + parseInt(parts[1] || '0');
        };

        const startMinutes = parseTime(createDto.actual_start_time);
        const endMinutes = parseTime(createDto.actual_end_time);

        // For same-day shifts, start must be before end
        // For overnight shifts (end < start), we allow it as it's a valid pattern
        // But we need to ensure the times are valid
        if (startMinutes === endMinutes) {
          throw new BadRequestException(
            'Start time and end time cannot be the same.'
          );
        }
      }

      // Note: Employee conflict checking is handled at the assignment level
      // Room schedules are room-based, not employee-based
      // Employees are assigned to room schedules via employee_room_assignments

      const schedule = this.RoomScheduleRepository.create({
        ...createDto,
        schedule_status: ScheduleStatus.SCHEDULED,
      });
      return await this.RoomScheduleRepository.save(schedule);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  async findMany(
    paginationDto: RepositoryPaginationDto & RoomScheduleSearchFilters
  ): Promise<PaginatedResponseDto<RoomSchedule>> {
    try {
      const result = await this.RoomScheduleRepository.findWithPagination(
        paginationDto
      );
      return {
        data: result.schedules,
        total: result.total,
        page: result.page,
        limit: paginationDto.limit || 10,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch room schedules');
    }
  }

  async findAll(
    filters?: RoomScheduleSearchFilters
  ): Promise<RoomSchedule[]> {
    try {
      const schedules = await this.RoomScheduleRepository.findWithFilters(filters || {});
      return schedules;
    } catch (error) {
      throw new BadRequestException('Failed to fetch all room schedules');
    }
  }

  async findOne(id: string): Promise<RoomSchedule> {
    try {
      const schedule = await this.RoomScheduleRepository.findOne({
        where: { schedule_id: id },
        relations: [
          'employeeRoomAssignments', 
          'employeeRoomAssignments.employee', 
          'room', 
          'room.serviceRooms',
          'room.serviceRooms.service',
          'shift_template'
        ],
      });

      if (!schedule) {
        throw new NotFoundException('Room schedule not found');
      }

      return schedule;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch room schedule');
    }
  }

  async update(
    id: string,
    updateDto: UpdateRoomScheduleDto
  ): Promise<RoomSchedule> {
    try {
      const schedule = await this.findOne(id);

      // Disallow any updates if already COMPLETED or CANCELLED
      if (
        schedule.schedule_status === ScheduleStatus.COMPLETED ||
        schedule.schedule_status === ScheduleStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'Completed or cancelled schedules cannot be edited'
        );
      }

      // Determine the values after update
      const finalEndTime = updateDto.actual_end_time !== undefined 
        ? updateDto.actual_end_time 
        : schedule.actual_end_time;
      
      const finalStartTime = updateDto.actual_start_time !== undefined
        ? updateDto.actual_start_time
        : schedule.actual_start_time;

      const finalWorkDate = updateDto.work_date || schedule.work_date;

      // Guard: only allow cancelling when current status is SCHEDULED and work_date is at least 1 day in the future.
      // Also disallow changing status to anything else.
      if (updateDto.schedule_status !== undefined) {
        if (updateDto.schedule_status === ScheduleStatus.CANCELLED) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const workDate = new Date(finalWorkDate);
          workDate.setHours(0, 0, 0, 0);

          const diffTime = workDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (
            schedule.schedule_status !== ScheduleStatus.SCHEDULED ||
            diffDays < 1
          ) {
            throw new BadRequestException(
              'Only schedules with status SCHEDULED and at least 1 day in the future can be cancelled'
            );
          }
        } else if (updateDto.schedule_status !== schedule.schedule_status) {
          // Any other status change is not allowed
          throw new BadRequestException(
            'Schedule status can only change from SCHEDULED to CANCELLED'
          );
        }
      }

      // Check if schedule should be automatically marked as completed
      // A schedule is considered "done" when:
      // 1. Both actual_start_time and actual_end_time are set
      // 2. The work_date is today or in the past
      if (finalStartTime && finalEndTime && finalWorkDate) {
        const workDate = new Date(finalWorkDate);
        workDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // If work date is today or in the past, and both times are set, mark as completed
        if (workDate <= today) {
          // Only auto-complete if:
          // - Status is not explicitly being set to something else in the update
          // - Current status is not CANCELLED
          // - Status is not already COMPLETED (to avoid unnecessary updates)
          const explicitStatusUpdate = updateDto.schedule_status !== undefined;
          const isCancelled =
            schedule.schedule_status === ScheduleStatus.CANCELLED;
          const isAlreadyCompleted =
            schedule.schedule_status === ScheduleStatus.COMPLETED;

          if (!explicitStatusUpdate && !isCancelled && !isAlreadyCompleted) {
            updateDto.schedule_status = ScheduleStatus.COMPLETED;
          }
        }
      }

      Object.assign(schedule, updateDto);
      return await this.RoomScheduleRepository.save(schedule);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update room schedule');
    }
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const schedule = await this.findOne(id);
      await this.RoomScheduleRepository.remove(schedule);
      return {
        success: true,
        message: 'Room schedule deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete room schedule');
    }
  }

  async findByEmployeeId(
    employeeId: string,
    limit?: number
  ): Promise<RoomSchedule[]> {
    try {
      return await this.RoomScheduleRepository.findByEmployeeId(
        employeeId,
        limit
      );
    } catch (error) {
      throw new BadRequestException('Failed to fetch room schedules');
    }
  }

  async findByCurrentUser(
    userId: string,
    limit?: number,
    startDate?: string,
    endDate?: string
  ): Promise<RoomSchedule[]> {
    try {
      // If date range is provided, use date range filter
      if (startDate && endDate) {
        return await this.RoomScheduleRepository.findByDateRange(
          startDate,
          endDate,
          userId
        );
      }

      // Otherwise, just get schedules by employee ID with optional limit
      return await this.RoomScheduleRepository.findByEmployeeId(
        userId,
        limit
      );
    } catch (error) {
      throw new BadRequestException('Failed to fetch current user schedules');
    }
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
    employeeId?: string
  ): Promise<RoomSchedule[]> {
    try {
      return await this.RoomScheduleRepository.findByDateRange(
        startDate,
        endDate,
        employeeId
      );
    } catch (error) {
      throw new BadRequestException('Failed to fetch schedules by date range');
    }
  }

  async findByRoomAndDate(
    roomId: string,
    workDate: string
  ): Promise<RoomSchedule[]> {
    try {
      return await this.RoomScheduleRepository.findByRoomAndDate(
        roomId,
        workDate
      );
    } catch (error) {
      throw new BadRequestException('Failed to fetch room schedules');
    }
  }

  async findWithFilters(
    filters: RoomScheduleSearchFilters
  ): Promise<RoomSchedule[]> {
    try {
      return await this.RoomScheduleRepository.findWithFilters(filters);
    } catch (error) {
      throw new BadRequestException('Failed to fetch schedules with filters');
    }
  }

  async getStats(employeeId?: string): Promise<any> {
    try {
      return await this.RoomScheduleRepository.getScheduleStats(employeeId);
    } catch (error) {
      throw new BadRequestException('Failed to fetch schedule statistics');
    }
  }

  // Bulk Operations
  async createBulk(
    schedules: CreateRoomScheduleDto[]
  ): Promise<RoomSchedule[]> {
    try {
      // Validate all schedules before creating
      const errors: string[] = [];
      
      for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];
        
        // Validate work_date is at least 1 day in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const scheduleDate = new Date(schedule.work_date);
        scheduleDate.setHours(0, 0, 0, 0);
        
        const diffTime = scheduleDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 1) {
          errors.push(`Schedule ${i + 1}: work_date must be at least 1 day in advance`);
        }

        // Validate that start_time and end_time are provided when creating new schedule
        if (!schedule.shift_template_id) {
          if (!schedule.actual_start_time || !schedule.actual_end_time) {
            errors.push(`Schedule ${i + 1}: Start time and end time are required when creating a new schedule without a shift template`);
          } else {
            // Validate start time is before end time
            const parseTime = (timeStr: string) => {
              const parts = timeStr.split(':');
              return parseInt(parts[0]) * 60 + parseInt(parts[1] || '0');
            };

            const startMinutes = parseTime(schedule.actual_start_time);
            const endMinutes = parseTime(schedule.actual_end_time);

            if (startMinutes === endMinutes) {
              errors.push(`Schedule ${i + 1}: Start time and end time cannot be the same`);
            }
          }
        }
      }

      if (errors.length > 0) {
        throw new BadRequestException(errors.join('; '));
      }

      // Create all schedules
      const createdSchedules: RoomSchedule[] = [];
      for (const schedule of schedules) {
        const entity = this.RoomScheduleRepository.create(schedule);
        const saved = await this.RoomScheduleRepository.save(entity);
        createdSchedules.push(saved);
      }

      return createdSchedules;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create bulk schedules');
    }
  }

  async updateBulk(
    updates: { id: string; data: UpdateRoomScheduleDto }[]
  ): Promise<RoomSchedule[]> {
    try {
      const updatedSchedules: RoomSchedule[] = [];

      for (const update of updates) {
        const schedule = await this.findOne(update.id);
        
        // Disallow any updates if already COMPLETED or CANCELLED
        if (
          schedule.schedule_status === ScheduleStatus.COMPLETED ||
          schedule.schedule_status === ScheduleStatus.CANCELLED
        ) {
          throw new BadRequestException(
            'Completed or cancelled schedules cannot be edited'
          );
        }

        // Apply the same auto-completion logic as in the update method
        const finalEndTime = update.data.actual_end_time !== undefined 
          ? update.data.actual_end_time 
          : schedule.actual_end_time;
        
        const finalStartTime = update.data.actual_start_time !== undefined
          ? update.data.actual_start_time
          : schedule.actual_start_time;

        const finalWorkDate = update.data.work_date || schedule.work_date;

        // Guard: only allow cancelling when current status is SCHEDULED and work_date is at least 1 day in the future.
        // Also disallow changing status to anything else.
        if (update.data.schedule_status !== undefined) {
          if (update.data.schedule_status === ScheduleStatus.CANCELLED) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const workDate = new Date(finalWorkDate);
            workDate.setHours(0, 0, 0, 0);

            const diffTime = workDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (
              schedule.schedule_status !== ScheduleStatus.SCHEDULED ||
              diffDays < 1
            ) {
              throw new BadRequestException(
                'Only schedules with status SCHEDULED and at least 1 day in the future can be cancelled'
              );
            }
          } else if (update.data.schedule_status !== schedule.schedule_status) {
            // Any other status change is not allowed
            throw new BadRequestException(
              'Schedule status can only change from SCHEDULED to CANCELLED'
            );
          }
        }

        if (finalStartTime && finalEndTime && finalWorkDate) {
          const workDate = new Date(finalWorkDate);
          workDate.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (workDate <= today) {
          const explicitStatusUpdate = update.data.schedule_status !== undefined;
          const isCancelled =
            schedule.schedule_status === ScheduleStatus.CANCELLED;
          const isAlreadyCompleted =
            schedule.schedule_status === ScheduleStatus.COMPLETED;
            
          if (!explicitStatusUpdate && !isCancelled && !isAlreadyCompleted) {
            update.data.schedule_status = ScheduleStatus.COMPLETED;
          }
          }
        }
        
        Object.assign(schedule, update.data);
        const saved = await this.RoomScheduleRepository.save(schedule);
        updatedSchedules.push(saved);
      }

      return updatedSchedules;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update bulk schedules');
    }
  }

  async deleteBulk(ids: string[]): Promise<boolean> {
    try {
      for (const id of ids) {
        await this.findOne(id);
      }

      const result = await this.RoomScheduleRepository.removeByIds(ids);
      return result.affected > 0;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete bulk schedules');
    }
  }

  async copyWeek(
    sourceWeekStart: string,
    targetWeekStart: string,
    employeeId?: string
  ): Promise<RoomSchedule[]> {
    try {
      const sourceWeekEnd = new Date(
        new Date(sourceWeekStart).getTime() + 6 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      // Get source schedules
      const sourceSchedules = await this.findByDateRange(
        sourceWeekStart,
        sourceWeekEnd,
        employeeId
      );

      if (sourceSchedules.length === 0) {
        throw new BadRequestException('No schedules found in source week');
      }

      // Create new schedules for target week
      const newSchedules: CreateRoomScheduleDto[] = [];
      const targetStartDate = new Date(targetWeekStart);

      for (const schedule of sourceSchedules) {
        const scheduleDate = new Date(schedule.work_date);
        const dayOfWeek = scheduleDate.getDay();

        const newDate = new Date(targetStartDate);
        newDate.setDate(targetStartDate.getDate() + dayOfWeek);

        newSchedules.push({
          room_id: schedule.room_id,
          shift_template_id: schedule.shift_template_id,
          work_date: newDate.toISOString().split('T')[0],
          actual_start_time: schedule.actual_start_time,
          actual_end_time: schedule.actual_end_time,
          schedule_status: schedule.schedule_status,
          notes: schedule.notes,
          overtime_hours: schedule.overtime_hours,
          created_by: schedule.created_by,
        });
      }

      return await this.createBulk(newSchedules);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to copy week schedules');
    }
  }
  
  async checkConflict(
    employeeId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeScheduleId?: string
  ): Promise<{ hasConflict: boolean; conflictingSchedule?: RoomSchedule }> {
    try {
      // Find schedules where employee is assigned via employeeRoomAssignments
      const existingSchedules =
        await this.RoomScheduleRepository.findByEmployeeId(employeeId);

      const conflictingSchedule = existingSchedules.find((schedule) => {
        if (schedule.work_date !== date) return false;
        if (schedule.schedule_status === ScheduleStatus.CANCELLED) return false;
        if (excludeScheduleId && schedule.schedule_id === excludeScheduleId)
          return false;

        const scheduleStart = schedule.actual_start_time || '00:00';
        const scheduleEnd = schedule.actual_end_time || '23:59';

        // Check for time overlap
        return startTime < scheduleEnd && endTime > scheduleStart;
      });

      return {
        hasConflict: !!conflictingSchedule,
        conflictingSchedule,
      };
    } catch (error) {
      throw new BadRequestException('Failed to check schedule conflict');
    }
  }


  async getOverlappingSchedules(
    roomId: string,
    role: Roles,
    search?: string
  ): Promise<RoomSchedule[]> {
    try {
      return await this.RoomScheduleRepository.getOverlappingSchedules(
        roomId,
        role,
        search
      );
    } catch (error) {
      throw new BadRequestException('Failed to fetch overlapping schedules');
    }
  }

  /**
   * Automatically mark schedules as COMPLETED when they are done
   * A schedule is considered done when:
   * 1. The work_date is in the past, OR
   * 2. The work_date is today and the actual_end_time has passed
   * 3. Both actual_start_time and actual_end_time are set
   * 4. Status is SCHEDULED or IN_PROGRESS (not already COMPLETED or CANCELLED)
   */
  async autoMarkCompletedSchedules(): Promise<{
    updatedCount: number;
    schedules: RoomSchedule[];
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 8); // HH:MM:SS format

      // Use repository's findWithFilters to efficiently query only schedules that could be completed
      // Get SCHEDULED/IN_PROGRESS schedules with work_date <= today
      const scheduledSchedules =
        await this.RoomScheduleRepository.findWithFilters({
          workDateTo: todayStr,
          scheduleStatus: ScheduleStatus.SCHEDULED,
        });
      const inProgressSchedules =
        await this.RoomScheduleRepository.findWithFilters({
          workDateTo: todayStr,
          scheduleStatus: ScheduleStatus.IN_PROGRESS,
        });

      // Combine and filter to only those that should be completed
      const candidateSchedules = [
        ...scheduledSchedules.filter(
          (s) => s.actual_start_time && s.actual_end_time
        ),
        ...inProgressSchedules.filter(
          (s) => s.actual_start_time && s.actual_end_time
        ),
      ];
      
      const schedulesToComplete = candidateSchedules.filter((schedule) => {
        // Work date must be today or in the past (already filtered by workDateTo)
        const workDate = new Date(schedule.work_date);
        workDate.setHours(0, 0, 0, 0);
        
        // If work date is today, check if end time has passed
        if (schedule.work_date === todayStr) {
          if (!schedule.actual_end_time) return false;
          const endTime = schedule.actual_end_time.substring(0, 8); // HH:MM:SS
          return endTime <= currentTime;
        }

        // If work date is in the past, it should be completed
        return workDate < today;
      });

      const completedSchedules: RoomSchedule[] = [];
      let updatedCount = 0;

      // Mark each schedule as completed
      for (const schedule of schedulesToComplete) {
        schedule.schedule_status = ScheduleStatus.COMPLETED;
        const saved = await this.RoomScheduleRepository.save(schedule);
        completedSchedules.push(saved);
        updatedCount++;
      }

      return {
        updatedCount,
        schedules: completedSchedules,
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to auto-mark completed schedules'
      );
    }
  }

  /**
   * Automatically mark schedules as IN_PROGRESS when their actual start time is reached.
   * Applies to schedules that are currently SCHEDULED and have:
   * - work_date = today
   * - actual_start_time set
   * - current time >= actual_start_time
   */
  async autoMarkInProgressSchedules(): Promise<{
    updatedCount: number;
    schedules: RoomSchedule[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 8); // HH:MM:SS

    const candidates = await this.RoomScheduleRepository.findWithFilters({
      workDateFrom: todayStr,
      workDateTo: todayStr,
      scheduleStatus: ScheduleStatus.SCHEDULED,
    });

    const toUpdate = candidates.filter(
      (schedule) =>
        schedule.actual_start_time &&
        schedule.actual_start_time.substring(0, 8) <= currentTime
    );

    let updatedCount = 0;
    const updatedSchedules: RoomSchedule[] = [];
    for (const schedule of toUpdate) {
      schedule.schedule_status = ScheduleStatus.IN_PROGRESS;
      const saved = await this.RoomScheduleRepository.save(schedule);
      updatedSchedules.push(saved);
      updatedCount++;
    }

    return { updatedCount, schedules: updatedSchedules };
  }
}
