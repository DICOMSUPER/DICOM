import { Injectable } from '@nestjs/common';
import { EntityManager, Between } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RepositoryPaginationDto } from '@backend/database';
import { EmployeeSchedule, ScheduleStatus } from '../entities/schedule/employee-schedules.entity';
import { EmployeeScheduleSearchFilters } from '../dto/schedule/employee-schedule.dto';

@Injectable()
export class EmployeeScheduleRepository extends BaseRepository<EmployeeSchedule> {
  constructor(entityManager: EntityManager) {
    super(EmployeeSchedule, entityManager);
  }

  async findByEmployeeId(employeeId: string, limit?: number): Promise<EmployeeSchedule[]> {
    return await this.findAll(
      { 
        where: { employee_id: employeeId }, 
        take: limit, 
        order: { work_date: 'DESC' } 
      },
      ['employee', 'room', 'shift_template']
    );
  }

  async findByDateRange(
    startDate: string, 
    endDate: string, 
    employeeId?: string
  ): Promise<EmployeeSchedule[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template')
      .where('schedule.work_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });

    if (employeeId) {
      queryBuilder.andWhere('schedule.employee_id = :employeeId', { employeeId });
    }

    return await queryBuilder
      .orderBy('schedule.work_date', 'ASC')
      .addOrderBy('schedule.actual_start_time', 'ASC')
      .getMany();
  }

  async findByRoomAndDate(roomId: string, workDate: string): Promise<EmployeeSchedule[]> {
    return await this.findAll(
      { 
        where: { room_id: roomId, work_date: workDate },
        order: { actual_start_time: 'ASC' }
      },
      ['employee', 'room', 'shift_template']
    );
  }

  async findWithFilters(filters: EmployeeScheduleSearchFilters = {}): Promise<EmployeeSchedule[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template');

    if (filters.employee_id) {
      queryBuilder.andWhere('schedule.employee_id = :employeeId', {
        employeeId: filters.employee_id
      });
    }

    if (filters.room_id) {
      queryBuilder.andWhere('schedule.room_id = :roomId', {
        roomId: filters.room_id
      });
    }

    if (filters.work_date_from) {
      queryBuilder.andWhere('schedule.work_date >= :workDateFrom', {
        workDateFrom: filters.work_date_from
      });
    }

    if (filters.work_date_to) {
      queryBuilder.andWhere('schedule.work_date <= :workDateTo', {
        workDateTo: filters.work_date_to
      });
    }

    if (filters.schedule_status) {
      queryBuilder.andWhere('schedule.schedule_status = :scheduleStatus', {
        scheduleStatus: filters.schedule_status
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder
      .orderBy('schedule.work_date', 'DESC')
      .addOrderBy('schedule.actual_start_time', 'ASC');

    return await queryBuilder.getMany();
  }

  async findWithPagination(paginationDto: RepositoryPaginationDto): Promise<{
    schedules: EmployeeSchedule[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const result = await this.paginate(paginationDto, {}, this.entityManager);
    
    return {
      schedules: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  async getScheduleStats(employeeId?: string): Promise<{
    totalSchedules: number;
    schedulesByStatus: Record<string, number>;
    schedulesThisMonth: number;
    averageOvertimeHours: number;
  }> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('schedule');

    if (employeeId) {
      queryBuilder.where('schedule.employee_id = :employeeId', { employeeId });
    }

    const totalSchedules = await queryBuilder.getCount();

    const schedulesByStatus = await queryBuilder
      .select('schedule.schedule_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('schedule.schedule_status')
      .getRawMany();

    const statusCounts = schedulesByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const schedulesThisMonth = await queryBuilder
      .where('schedule.work_date BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth: startOfMonth.toISOString().split('T')[0],
        endOfMonth: endOfMonth.toISOString().split('T')[0]
      })
      .getCount();

    const avgOvertimeResult = await queryBuilder
      .select('AVG(schedule.overtime_hours)', 'avgOvertime')
      .getRawOne();

    return {
      totalSchedules,
      schedulesByStatus: statusCounts,
      schedulesThisMonth,
      averageOvertimeHours: parseFloat(avgOvertimeResult?.avgOvertime || '0')
    };
  }
}
