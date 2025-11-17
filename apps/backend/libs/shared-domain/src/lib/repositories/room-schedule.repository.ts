import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoomSchedule } from '../entities/users/room-schedules.entity';
import {
  CreateRoomScheduleDto,
  RoomScheduleSearchFilters,
} from '../dto/schedule';
import { RepositoryPaginationDto } from '@backend/database';
import { Roles } from '@backend/shared-enums';
import moment from 'moment';
@Injectable()
export class RoomScheduleRepository {
  constructor(
    @InjectRepository(RoomSchedule)
    private readonly repository: Repository<RoomSchedule>
  ) {}

  create(data: CreateRoomScheduleDto): RoomSchedule {
    return this.repository.create(data);
  }

  async save(entity: RoomSchedule): Promise<RoomSchedule> {
    return await this.repository.save(entity);
  }

  async findOne(options: any): Promise<RoomSchedule | null> {
    return await this.repository.findOne(options);
  }

  async findWithPagination(
    paginationDto: RepositoryPaginationDto & RoomScheduleSearchFilters
  ): Promise<{
    schedules: RoomSchedule[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortField,
      order = 'desc',
    } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employeeRoomAssignments', 'assignments')
      .leftJoinAndSelect('assignments.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template');

    // Apply filters
    if (paginationDto.employeeId) {
      queryBuilder
        .andWhere('assignments.employeeId = :employeeId', {
          employeeId: paginationDto.employeeId,
        })
        .andWhere('assignments.isActive = :isActive', { isActive: true });
    }

    if (paginationDto.roomId) {
      queryBuilder.andWhere('schedule.room_id = :roomId', {
        roomId: paginationDto.roomId,
      });
    }

    if (paginationDto.workDateFrom) {
      queryBuilder.andWhere('schedule.work_date >= :workDateFrom', {
        workDateFrom: paginationDto.workDateFrom,
      });
    }

    if (paginationDto.workDateTo) {
      queryBuilder.andWhere('schedule.work_date <= :workDateTo', {
        workDateTo: paginationDto.workDateTo,
      });
    }

    if (paginationDto.scheduleStatus) {
      queryBuilder.andWhere('schedule.schedule_status = :scheduleStatus', {
        scheduleStatus: paginationDto.scheduleStatus,
      });
    }

    // Search functionality
    if (search) {
      queryBuilder.andWhere(
        '(employee.first_name ILIKE :search OR employee.last_name ILIKE :search OR room.room_name ILIKE :search OR schedule.notes ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Sorting
    if (sortField) {
      queryBuilder.orderBy(
        `schedule.${sortField}`,
        order.toUpperCase() as 'ASC' | 'DESC'
      );
    } else {
      queryBuilder
        .orderBy('schedule.work_date', 'DESC')
        .addOrderBy('schedule.actual_start_time', 'ASC');
    }

    const [schedules, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      schedules,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByEmployeeId(
    employeeId: string,
    limit?: number
  ): Promise<RoomSchedule[]> {
    const query = this.repository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employeeRoomAssignments', 'assignments')
      .leftJoinAndSelect('assignments.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template')
      .where('assignments.employeeId = :employeeId', { employeeId })
      .andWhere('assignments.isActive = :isActive', { isActive: true })
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
  ): Promise<RoomSchedule[]> {
    const query = this.repository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employeeRoomAssignments', 'assignments')
      .leftJoinAndSelect('assignments.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template')
      .where('schedule.work_date >= :startDate', { startDate })
      .andWhere('schedule.work_date <= :endDate', { endDate })
      .orderBy('schedule.work_date', 'ASC')
      .addOrderBy('schedule.actual_start_time', 'ASC');

    if (employeeId) {
      query
        .andWhere('assignments.employeeId = :employeeId', { employeeId })
        .andWhere('assignments.isActive = :isActive', { isActive: true });
    }

    return await query.getMany();
  }

  async findByRoomAndDate(
    roomId: string,
    workDate: string
  ): Promise<RoomSchedule[]> {
    return await this.repository.find({
      where: { room_id: roomId, work_date: workDate },
      relations: [
        'employeeRoomAssignments',
        'employeeRoomAssignments.employee',
        'room',
        'shift_template',
      ],
      order: { actual_start_time: 'ASC' },
    });
  }

  async findWithFilters(
    filters: RoomScheduleSearchFilters
  ): Promise<RoomSchedule[]> {
    const query = this.repository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.employeeRoomAssignments', 'assignments')
      .leftJoinAndSelect('assignments.employee', 'employee')
      .leftJoinAndSelect('schedule.room', 'room')
      .leftJoinAndSelect('schedule.shift_template', 'shift_template');

    if (filters.employeeId) {
      const employeeId = filters.employeeId;
      query
        .andWhere('assignments.employeeId = :employeeId', {
          employeeId,
        })
        .andWhere('assignments.isActive = :isActive', { isActive: true });
    }

    if (filters.roomId) {
      const roomId = filters.roomId;
      query.andWhere('schedule.room_id = :roomId', { roomId });
    }

    if (filters.workDateFrom) {
      const workDateFrom = filters.workDateFrom;
      query.andWhere('schedule.work_date >= :workDateFrom', {
        workDateFrom,
      });
    }

    if (filters.workDateTo) {
      const workDateTo = filters.workDateTo;
      query.andWhere('schedule.work_date <= :workDateTo', {
        workDateTo,
      });
    }

    if (filters.scheduleStatus) {
      const scheduleStatus = filters.scheduleStatus;
      query.andWhere('schedule.schedule_status = :scheduleStatus', {
        scheduleStatus,
      });
    }

    if (filters.role) {
      query.andWhere('employee.role = :role', { role: filters.role });
    }

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.offset) {
      query.offset(filters.offset);
    }

    query
      .orderBy('schedule.work_date', 'ASC')
      .addOrderBy('schedule.actual_start_time', 'ASC');

    return await query.getMany();
  }

  async getScheduleStats(employeeId?: string): Promise<any> {
    const query = this.repository.createQueryBuilder('schedule');

    if (employeeId) {
      query
        .innerJoin(
          'schedule.employeeRoomAssignments',
          'assignments',
          'assignments.isActive = :isActive',
          { isActive: true }
        )
        .andWhere('assignments.employeeId = :employeeId', { employeeId });
    }

    const total = await query.getCount();
    const scheduled = await query
      .clone()
      .andWhere('schedule.schedule_status = :status', { status: 'scheduled' })
      .getCount();
    const confirmed = await query
      .clone()
      .andWhere('schedule.schedule_status = :status', { status: 'confirmed' })
      .getCount();
    const completed = await query
      .clone()
      .andWhere('schedule.schedule_status = :status', { status: 'completed' })
      .getCount();
    const cancelled = await query
      .clone()
      .andWhere('schedule.schedule_status = :status', { status: 'cancelled' })
      .getCount();
    const noShow = await query
      .clone()
      .andWhere('schedule.schedule_status = :status', { status: 'no_show' })
      .getCount();

    return {
      total,
      scheduled,
      confirmed,
      completed,
      cancelled,
      no_show: noShow,
    };
  }

  async remove(entity: RoomSchedule): Promise<RoomSchedule> {
    return await this.repository.remove(entity);
  }

  async removeByIds(ids: string[]): Promise<{ affected: number }> {
    const result = await this.repository.delete({ schedule_id: In(ids) });
    return { affected: result.affected || 0 };
  }

  async getOverlappingSchedules(roomId: string, role: Roles, search?: string) {
    // Use server current time (right now)
    const now = moment();
    const currentDate = now.format('YYYY-MM-DD');
    const yesterdayDate = now.clone().subtract(1, 'day').format('YYYY-MM-DD');
    const currentTime = now.format('HH:mm:ss');

    // Added NULL checks and role filter on the joined employee
    const qb = this.repository
      .createQueryBuilder('schedules')
      .leftJoinAndSelect('schedules.employeeRoomAssignments', 'assignments')
      .leftJoinAndSelect('assignments.employee', 'employee')
      .where('schedules.room_id = :roomId', { roomId })
      .andWhere('employee.role = :role', { role }) // Filter by passed role
      .andWhere(
        `(schedules.work_date = :currentDate
           AND schedules.actual_start_time IS NOT NULL
           AND schedules.actual_end_time IS NOT NULL
           AND (
             (schedules.actual_start_time > schedules.actual_end_time 
               AND (schedules.actual_start_time < :currentTime OR schedules.actual_end_time > :currentTime)
             ) 
             OR 
             (schedules.actual_start_time <= schedules.actual_end_time 
               AND schedules.actual_start_time < :currentTime 
               AND schedules.actual_end_time > :currentTime
             )
           )
          )
          OR 
          (schedules.work_date = :yesterdayDate
           AND schedules.actual_start_time IS NOT NULL
           AND schedules.actual_end_time IS NOT NULL
           AND schedules.actual_start_time > schedules.actual_end_time
           AND :currentTime < schedules.actual_end_time
          )`,
        { currentDate, yesterdayDate, currentTime }
      )
      .leftJoinAndSelect('schedules.room', 'room') // Optional
      .leftJoinAndSelect('schedules.shift_template', 'shift_template'); // Optional

    if (search) {
      qb.andWhere(
        '(employee.username ILIKE :search OR employee.email ILIKE :search OR employee.firstName ILIKE :search OR employee.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    return await qb.getMany();
  }
}
