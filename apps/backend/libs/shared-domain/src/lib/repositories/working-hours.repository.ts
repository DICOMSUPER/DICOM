import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { WorkingHours } from '../entities/users/working-hours.entity';
import { BreakTime } from '../entities/users/break-times.entity';
import { SpecialHours } from '../entities/users/special-hours.entity';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';

@Injectable()
export class WorkingHoursRepository extends BaseRepository<WorkingHours> {
  constructor(
    entityManager: EntityManager,
  ) {
    super(WorkingHours, entityManager);
  }

  // Working Hours
  async createWorkingHours(workingHours: Partial<WorkingHours>): Promise<WorkingHours> {
    const entity = this.repository.create(workingHours);
    return await this.repository.save(entity);
  }

  async findWorkingHours(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<WorkingHours>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.repository.findAndCount({
      relations: ['breakTimes'],
      skip: (page - 1) * limit,
      take: limit,
      order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    };
  }

  async findWorkingHoursById(id: string): Promise<WorkingHours | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['breakTimes']
    });
  }

  async findWorkingHoursByDay(dayOfWeek: string): Promise<WorkingHours | null> {
    return await this.repository.findOne({
      where: { dayOfWeek: dayOfWeek as any },
      relations: ['breakTimes']
    });
  }

  async updateWorkingHours(id: string, updates: Partial<WorkingHours>): Promise<WorkingHours> {
    await this.repository.update(id, updates);
    const result = await this.findWorkingHoursById(id);
    if (!result) {
      throw new Error('Working hours not found');
    }
    return result;
  }

  async deleteWorkingHours(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  // Break Times
  async createBreakTime(breakTime: Partial<BreakTime>): Promise<BreakTime> {
    const entity = this.entityManager.create(BreakTime, breakTime);
    return await this.entityManager.save(BreakTime, entity);
  }

  async findBreakTimesByWorkingHours(workingHoursId: string): Promise<BreakTime[]> {
    return await this.entityManager.find(BreakTime, {
      where: { workingHoursId, isActive: true },
      order: { startTime: 'ASC' }
    });
  }

  async updateBreakTime(id: string, updates: Partial<BreakTime>): Promise<BreakTime> {
    await this.entityManager.update(BreakTime, id, updates);
    const result = await this.entityManager.findOne(BreakTime, { where: { id } });
    if (!result) {
      throw new Error('Break time not found');
    }
    return result;
  }

  async deleteBreakTime(id: string): Promise<boolean> {
    const result = await this.entityManager.delete(BreakTime, id);
    return (result.affected ?? 0) > 0;
  }

  // Special Hours
  async createSpecialHours(specialHours: Partial<SpecialHours>): Promise<SpecialHours> {
    const entity = this.entityManager.create(SpecialHours, specialHours);
    return await this.entityManager.save(SpecialHours, entity);
  }

  async findSpecialHours(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<SpecialHours>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.entityManager.findAndCount(SpecialHours, {
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' }
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    };
  }

  async findSpecialHoursByDate(date: string): Promise<SpecialHours | null> {
    return await this.entityManager.findOne(SpecialHours, {
      where: { date, isActive: true }
    });
  }

  async findSpecialHoursById(id: string): Promise<SpecialHours | null> {
    return await this.entityManager.findOne(SpecialHours, { where: { id } });
  }

  async updateSpecialHours(id: string, updates: Partial<SpecialHours>): Promise<SpecialHours> {
    await this.entityManager.update(SpecialHours, id, updates);
    const result = await this.findSpecialHoursById(id);
    if (!result) {
      throw new Error('Special hours not found');
    }
    return result;
  }

  async deleteSpecialHours(id: string): Promise<boolean> {
    const result = await this.entityManager.delete(SpecialHours, id);
    return (result.affected ?? 0) > 0;
  }

  // Utility methods
  async checkTimeAvailability(date: string, startTime: string, endTime: string): Promise<boolean> {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Check if it's a holiday
    const specialHours = await this.findSpecialHoursByDate(date);
    if (specialHours?.isHoliday) {
      return false;
    }

    // Check regular working hours
    const workingHours = await this.findWorkingHoursByDay(dayOfWeek);
    if (!workingHours?.isEnabled) {
      return false;
    }

    // Check if time is within working hours
    if (startTime < workingHours.startTime || endTime > workingHours.endTime) {
      return false;
    }

    // Check break times
    const breakTimes = await this.findBreakTimesByWorkingHours(workingHours.id);
    for (const breakTime of breakTimes) {
      if (startTime < breakTime.endTime && endTime > breakTime.startTime) {
        return false;
      }
    }

    return true;
  }
}
