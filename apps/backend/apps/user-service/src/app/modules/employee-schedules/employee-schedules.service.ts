import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeSchedule } from './entities/employee-schedule.entity';
import { CreateEmployeeScheduleDto } from './dto/create-employee-schedule.dto';
import { UpdateEmployeeScheduleDto } from './dto/update-employee-schedule.dto';
import {
  EmployeeScheduleAlreadyExistsException,
  EmployeeScheduleCreationFailedException,
  EmployeeScheduleDeletionFailedException,
  EmployeeScheduleNotFoundException,
  EmployeeScheduleUpdateFailedException,
  InvalidEmployeeScheduleDataException,
} from '@backend/shared-exception';

@Injectable()
export class EmployeeSchedulesService {
  private readonly logger = new Logger('EmployeeSchedulesService');

  constructor(
    @InjectRepository(EmployeeSchedule)
    private readonly scheduleRepository: Repository<EmployeeSchedule>,
  ) {}

  async create(dto: CreateEmployeeScheduleDto): Promise<EmployeeSchedule> {
    try {
      this.logger.log(`Creating schedule for employee: ${dto.employeeId}`);

      if (!dto.employeeId || !dto.workDate) {
        throw new InvalidEmployeeScheduleDataException('Thiếu employeeId hoặc workDate');
      }

      const existing = await this.scheduleRepository.findOne({
        where: { employeeId: dto.employeeId, workDate: dto.workDate },
      });

      if (existing) {
        throw new EmployeeScheduleAlreadyExistsException(
          'Nhân viên này đã có lịch làm việc trong ngày này',
        );
      }

      const schedule = this.scheduleRepository.create(dto);
      return await this.scheduleRepository.save(schedule);
    } catch (error) {
      this.logger.error(`Create schedule error: ${(error as Error).message}`);
      if (
        error instanceof EmployeeScheduleAlreadyExistsException ||
        error instanceof InvalidEmployeeScheduleDataException
      ) {
        throw error;
      }
      throw new EmployeeScheduleCreationFailedException();
    }
  }

  async findAll(): Promise<EmployeeSchedule[]> {
    return this.scheduleRepository.find({
      relations: ['employee', 'room', 'shiftTemplate', 'creator'],
    });
  }

  async findOne(id: string): Promise<EmployeeSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['employee', 'room', 'shiftTemplate', 'creator'],
    });
    if (!schedule) {
      throw new EmployeeScheduleNotFoundException();
    }
    return schedule;
  }

  async update(id: string, dto: UpdateEmployeeScheduleDto): Promise<EmployeeSchedule> {
    const schedule = await this.findOne(id);
    Object.assign(schedule, dto);
    try {
      return await this.scheduleRepository.save(schedule);
    } catch (error) {
      this.logger.error(`Update schedule error: ${(error as Error).message}`);
      throw new EmployeeScheduleUpdateFailedException();
    }
  }

  async remove(id: string): Promise<boolean> {
    const schedule = await this.findOne(id);
    try {
      await this.scheduleRepository.remove(schedule);
      return true;
    } catch (error) {
      this.logger.error(`Delete schedule error: ${(error as Error).message}`);
      throw new EmployeeScheduleDeletionFailedException();
    }
  }
}
