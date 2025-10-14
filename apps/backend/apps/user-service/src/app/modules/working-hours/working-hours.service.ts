import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { WorkingHoursRepository } from '@backend/shared-domain';
import { 
  CreateWorkingHoursDto, 
  UpdateWorkingHoursDto,
  CreateBreakTimeDto,
  UpdateBreakTimeDto,
  CreateSpecialHoursDto,
  UpdateSpecialHoursDto
} from '@backend/shared-domain';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';
import { WorkingHours, BreakTime, SpecialHours } from '@backend/shared-domain';

@Injectable()
export class WorkingHoursService {
  private readonly workingHoursRepository: WorkingHoursRepository;

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.workingHoursRepository = new WorkingHoursRepository(this.entityManager);
  }

  // Working Hours
  async createWorkingHours(createDto: CreateWorkingHoursDto): Promise<WorkingHours> {
    try {
      // Check if working hours already exist for this day
      const existing = await this.workingHoursRepository.findWorkingHoursByDay(createDto.dayOfWeek);
      if (existing) {
        throw new BadRequestException(`Working hours already exist for ${createDto.dayOfWeek}`);
      }

      return await this.workingHoursRepository.createWorkingHours(createDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create working hours');
    }
  }

  async findWorkingHours(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<WorkingHours>> {
    try {
      return await this.workingHoursRepository.findWorkingHours(paginationDto);
    } catch (error) {
      throw new BadRequestException('Failed to fetch working hours');
    }
  }

  async findWorkingHoursById(id: string): Promise<WorkingHours> {
    try {
      const workingHours = await this.workingHoursRepository.findWorkingHoursById(id);
      if (!workingHours) {
        throw new NotFoundException('Working hours not found');
      }
      return workingHours;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch working hours');
    }
  }

  async updateWorkingHours(id: string, updateDto: UpdateWorkingHoursDto): Promise<WorkingHours> {
    try {
      await this.findWorkingHoursById(id); // Check if exists
      return await this.workingHoursRepository.updateWorkingHours(id, updateDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update working hours');
    }
  }

  async deleteWorkingHours(id: string): Promise<boolean> {
    try {
      await this.findWorkingHoursById(id);
      return await this.workingHoursRepository.deleteWorkingHours(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete working hours');
    }
  }

  // Break Times
  async createBreakTime(createDto: CreateBreakTimeDto): Promise<BreakTime> {
    try {
      // Validate that working hours exist
      await this.findWorkingHoursById(createDto.workingHoursId);
      
      // Validate break time is within working hours
      const workingHours = await this.workingHoursRepository.findWorkingHoursById(createDto.workingHoursId);
      if (!workingHours) {
        throw new NotFoundException('Working hours not found');
      }
      if (createDto.startTime < workingHours.startTime || createDto.endTime > workingHours.endTime) {
        throw new BadRequestException('Break time must be within working hours');
      }

      return await this.workingHoursRepository.createBreakTime(createDto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create break time');
    }
  }

  async findBreakTimesByWorkingHours(workingHoursId: string): Promise<BreakTime[]> {
    try {
      await this.findWorkingHoursById(workingHoursId);
      return await this.workingHoursRepository.findBreakTimesByWorkingHours(workingHoursId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch break times');
    }
  }

  async updateBreakTime(id: string, updateDto: UpdateBreakTimeDto): Promise<BreakTime> {
    try {
      // Check if break time exists by trying to update it
      const result = await this.workingHoursRepository.updateBreakTime(id, updateDto);
      if (!result) {
        throw new NotFoundException('Break time not found');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update break time');
    }
  }

  async deleteBreakTime(id: string): Promise<boolean> {
    try {
      const result = await this.workingHoursRepository.deleteBreakTime(id);
      if (!result) {
        throw new NotFoundException('Break time not found');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete break time');
    }
  }

  // Special Hours
  async createSpecialHours(createDto: CreateSpecialHoursDto): Promise<SpecialHours> {
    try {
      // Check if special hours already exist for this date
      const existing = await this.workingHoursRepository.findSpecialHoursByDate(createDto.date);
      if (existing) {
        throw new BadRequestException(`Special hours already exist for ${createDto.date}`);
      }

      return await this.workingHoursRepository.createSpecialHours(createDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create special hours');
    }
  }

  async findSpecialHours(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<SpecialHours>> {
    try {
      return await this.workingHoursRepository.findSpecialHours(paginationDto);
    } catch (error) {
      throw new BadRequestException('Failed to fetch special hours');
    }
  }

  async findSpecialHoursById(id: string): Promise<SpecialHours> {
    try {
      const specialHours = await this.workingHoursRepository.findSpecialHoursById(id);
      if (!specialHours) {
        throw new NotFoundException('Special hours not found');
      }
      return specialHours;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch special hours');
    }
  }

  async updateSpecialHours(id: string, updateDto: UpdateSpecialHoursDto): Promise<SpecialHours> {
    try {
      await this.findSpecialHoursById(id);
      return await this.workingHoursRepository.updateSpecialHours(id, updateDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update special hours');
    }
  }

  async deleteSpecialHours(id: string): Promise<boolean> {
    try {
      await this.findSpecialHoursById(id);
      return await this.workingHoursRepository.deleteSpecialHours(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete special hours');
    }
  }

  // Utility methods
  async checkTimeAvailability(date: string, startTime: string, endTime: string): Promise<boolean> {
    try {
      return await this.workingHoursRepository.checkTimeAvailability(date, startTime, endTime);
    } catch (error) {
      throw new BadRequestException('Failed to check time availability');
    }
  }

  async getWorkingHoursForDate(date: string): Promise<{ workingHours: WorkingHours | null, specialHours: SpecialHours | null }> {
    try {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const workingHours = await this.workingHoursRepository.findWorkingHoursByDay(dayOfWeek);
      const specialHours = await this.workingHoursRepository.findSpecialHoursByDate(date);
      
      return { workingHours, specialHours };
    } catch (error) {
      throw new BadRequestException('Failed to get working hours for date');
    }
  }
}
