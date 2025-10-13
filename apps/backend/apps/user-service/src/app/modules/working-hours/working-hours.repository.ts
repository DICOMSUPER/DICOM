import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkingHours, BreakTime, SpecialHours } from '@backend/shared-domain';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';

@Injectable()
export class WorkingHoursRepository {
  constructor(
    @InjectRepository(WorkingHours)
    private readonly workingHoursRepo: Repository<WorkingHours>,
    @InjectRepository(BreakTime)
    private readonly breakTimeRepo: Repository<BreakTime>,
    @InjectRepository(SpecialHours)
    private readonly specialHoursRepo: Repository<SpecialHours>,
  ) {}

  // Working Hours
  async createWorkingHours(workingHours: Partial<WorkingHours>): Promise<WorkingHours> {
    const entity = this.workingHoursRepo.create(workingHours);
    return await this.workingHoursRepo.save(entity);
  }

  async findWorkingHours(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<WorkingHours>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.workingHoursRepo.findAndCount({
      relations: ['breakTimes'],
      skip: (page - 1) * limit,
      take: limit,
      order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    };
  }

  async findWorkingHoursById(id: string): Promise<WorkingHours | null> {
    return await this.workingHoursRepo.findOne({
      where: { id },
      relations: ['breakTimes']
    });
  }

  async findWorkingHoursByDay(dayOfWeek: string): Promise<WorkingHours | null> {
    return await this.workingHoursRepo.findOne({
      where: { dayOfWeek: dayOfWeek as any },
      relations: ['breakTimes']
    });
  }

  async updateWorkingHours(id: string, updates: Partial<WorkingHours>): Promise<WorkingHours> {
    await this.workingHoursRepo.update(id, updates);
    return await this.findWorkingHoursById(id);
  }

  async deleteWorkingHours(id: string): Promise<boolean> {
    const result = await this.workingHoursRepo.delete(id);
    return result.affected > 0;
  }

  // Break Times
  async createBreakTime(breakTime: Partial<BreakTime>): Promise<BreakTime> {
    const entity = this.breakTimeRepo.create(breakTime);
    return await this.breakTimeRepo.save(entity);
  }

  async findBreakTimesByWorkingHours(workingHoursId: string): Promise<BreakTime[]> {
    return await this.breakTimeRepo.find({
      where: { workingHoursId, isActive: true },
      order: { startTime: 'ASC' }
    });
  }

  async updateBreakTime(id: string, updates: Partial<BreakTime>): Promise<BreakTime> {
    await this.breakTimeRepo.update(id, updates);
    return await this.breakTimeRepo.findOne({ where: { id } });
  }

  async deleteBreakTime(id: string): Promise<boolean> {
    const result = await this.breakTimeRepo.delete(id);
    return result.affected > 0;
  }

  // Special Hours
  async createSpecialHours(specialHours: Partial<SpecialHours>): Promise<SpecialHours> {
    const entity = this.specialHoursRepo.create(specialHours);
    return await this.specialHoursRepo.save(entity);
  }

  async findSpecialHours(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<SpecialHours>> {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.specialHoursRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' }
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    };
  }

  async findSpecialHoursByDate(date: string): Promise<SpecialHours | null> {
    return await this.specialHoursRepo.findOne({
      where: { date, isActive: true }
    });
  }

  async findSpecialHoursById(id: string): Promise<SpecialHours | null> {
    return await this.specialHoursRepo.findOne({ where: { id } });
  }

  async updateSpecialHours(id: string, updates: Partial<SpecialHours>): Promise<SpecialHours> {
    await this.specialHoursRepo.update(id, updates);
    return await this.findSpecialHoursById(id);
  }

  async deleteSpecialHours(id: string): Promise<boolean> {
    const result = await this.specialHoursRepo.delete(id);
    return result.affected > 0;
  }

  // Utility methods
  async checkTimeAvailability(date: string, startTime: string, endTime: string): Promise<boolean> {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    
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
