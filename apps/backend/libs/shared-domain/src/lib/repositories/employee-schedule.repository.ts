import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EmployeeSchedule } from '../entities/users/employee-schedules.entity';
import { CreateEmployeeScheduleDto, EmployeeScheduleSearchFilters } from '../dto/schedule';
import { RepositoryPaginationDto } from '@backend/database';

@Injectable()
export class EmployeeScheduleRepository {
  constructor(
    @InjectRepository(EmployeeSchedule)
    private readonly repository: Repository<EmployeeSchedule>,
  ) {}

  create(data: CreateEmployeeScheduleDto): EmployeeSchedule {
    return this.repository.create(data);
  }

  async save(entity: EmployeeSchedule): Promise<EmployeeSchedule> {
    return await this.repository.save(entity);
  }

  async findOne(options: any): Promise<EmployeeSchedule | null> {
    return await this.repository.findOne(options);
  }

  async findWithPagination(paginationDto: RepositoryPaginationDto): Promise<{
    schedules: EmployeeSchedule[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [schedules, total] = await this.repository.findAndCount({
      relations: ['employee', 'room', 'shift_template'],
      skip: (page - 1) * limit,
      take: limit,
      order: { work_date: 'DESC', actual_start_time: 'ASC' }
    });

    return {
      schedules,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByEmployeeId(employeeId: string, limit?: number): Promise<EmployeeSchedule[]> {
    const query = this.repository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template')
      .where('schedule.employee_id = :employeeId', { employeeId })
      .orderBy('schedule.work_date', 'DESC')
      .addOrderBy('schedule.actual_start_time', 'ASC');

    if (limit) {
      query.limit(limit);
    }

    return await query.getMany();
  }

  async findByDateRange(
    startDate: string, 
    endDate: string, 
    employeeId?: string
  ): Promise<EmployeeSchedule[]> {
    const query = this.repository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template')
      .where('schedule.work_date >= :startDate', { startDate })
      .andWhere('schedule.work_date <= :endDate', { endDate })
      .orderBy('schedule.work_date', 'ASC')
      .addOrderBy('schedule.actual_start_time', 'ASC');

    if (employeeId) {
      query.andWhere('schedule.employee_id = :employeeId', { employeeId });
    }

    return await query.getMany();
  }

  async findByRoomAndDate(roomId: string, workDate: string): Promise<EmployeeSchedule[]> {
    return await this.repository.find({
      where: { room_id: roomId, work_date: workDate },
      relations: ['employee', 'room', 'shift_template'],
      order: { actual_start_time: 'ASC' }
    });
  }

  async findWithFilters(filters: EmployeeScheduleSearchFilters): Promise<EmployeeSchedule[]> {
    const query = this.repository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template');

    if (filters.employeeId) {
      query.andWhere('schedule.employee_id = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters.roomId) {
      query.andWhere('schedule.room_id = :roomId', { roomId: filters.roomId });
    }

    if (filters.workDateFrom) {
      query.andWhere('schedule.work_date >= :workDateFrom', { workDateFrom: filters.workDateFrom });
    }

    if (filters.workDateTo) {
      query.andWhere('schedule.work_date <= :workDateTo', { workDateTo: filters.workDateTo });
    }

    if (filters.scheduleStatus) {
      query.andWhere('schedule.schedule_status = :scheduleStatus', { scheduleStatus: filters.scheduleStatus });
    }

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.offset) {
      query.offset(filters.offset);
    }

    query.orderBy('schedule.work_date', 'ASC').addOrderBy('schedule.actual_start_time', 'ASC');

    return await query.getMany();
  }

  async getScheduleStats(employeeId?: string): Promise<any> {
    const query = this.repository.createQueryBuilder('schedule');

    if (employeeId) {
      query.where('schedule.employee_id = :employeeId', { employeeId });
    }

    const total = await query.getCount();
    const confirmed = await query.clone().andWhere('schedule.schedule_status = :status', { status: 'confirmed' }).getCount();
    const completed = await query.clone().andWhere('schedule.schedule_status = :status', { status: 'completed' }).getCount();
    const cancelled = await query.clone().andWhere('schedule.schedule_status = :status', { status: 'cancelled' }).getCount();

    return {
      total,
      confirmed,
      completed,
      cancelled,
      pending: total - confirmed - completed - cancelled
    };
  }

  async remove(entity: EmployeeSchedule): Promise<EmployeeSchedule> {
    return await this.repository.remove(entity);
  }

  async removeByIds(ids: string[]): Promise<{ affected: number }> {
    const result = await this.repository.delete({ schedule_id: In(ids) });
    return { affected: result.affected || 0 };
  }
}
