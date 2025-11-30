import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { EmployeeRoomAssignment } from '@backend/shared-domain';
import moment from 'moment';

export interface EmployeeRoomAssignmentStats {
  [day: string]: number;
}

@Injectable()
export class EmployeeRoomAssignmentRepository extends BaseRepository<EmployeeRoomAssignment> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(EmployeeRoomAssignment, entityManager);
  }

  async getEmployeeRoomAssignmentStats(data: {
    employeeId: string;
    startDate?: Date | string;
    endDate?: Date | string;
  }): Promise<EmployeeRoomAssignmentStats> {
    const startDate = new Date(data.startDate as string);
    const endDate = new Date(data.endDate as string);

    // Generate all dates between start and end first
    const dateArray: string[] = [];
    const result = new Map<string, number>();

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const isoDate = currentDate.toISOString().split('T')[0];
      dateArray.push(isoDate);
      result.set(isoDate, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('Query params:', {
      employeeId: data.employeeId,
      dateArrayLength: dateArray.length,
      dateRange: `${dateArray[0]} to ${dateArray[dateArray.length - 1]}`,
    });

    if (dateArray.length === 0) {
      const obj: EmployeeRoomAssignmentStats = {};
      result.forEach((value, key) => {
        obj[key] = value;
      });
      return obj;
    }

    // Use IN clause with the date array
    const employeeRoomAssignments = await this.repository
      .createQueryBuilder('era')
      .innerJoinAndSelect('era.roomSchedule', 'rs')
      .where('era.employeeId = :employeeId', { employeeId: data.employeeId })
      .andWhere('rs.work_date IN (:...dateArray)', { dateArray })
      .andWhere('era.isActive = :isActive', { isActive: true })
      .andWhere('era.isDeleted = :notDeleted', { notDeleted: false })
      .getMany();

    // console.log(`Found ${employeeRoomAssignments.length} assignments`);

    // Debug: Log what we found
    // employeeRoomAssignments.forEach((assignment, index) => {
    //   console.log(`Assignment ${index + 1}:`, {
    //     assignmentId: assignment.id,
    //     workDate: assignment.roomSchedule?.work_date,
    //     employeeId: assignment.employeeId,
    //   });
    // });

    // Count actual assignments
    employeeRoomAssignments.forEach((assignment) => {
      const date = assignment.roomSchedule?.work_date;
      if (!date) return;

      result.set(date, (result.get(date) || 0) + 1);
    });

    // Convert Map → plain object
    const obj: EmployeeRoomAssignmentStats = {};
    result.forEach((value, key) => {
      obj[key] = value;
    });

    return obj;
  }

  async findByEmployeeInCurrentSession(
    employeeId: string
  ): Promise<EmployeeRoomAssignment[]> {
    // const currentDate = new Date();
    console.log('employee id', employeeId);

    const currentDateString = moment().format('YYYY-MM-DD');
    const currentTimeString = moment().format('HH:mm:ss');

    console.log('Current date:', currentDateString);
    console.log('Current time:', currentTimeString);

    return await this.entityManager
      .createQueryBuilder(EmployeeRoomAssignment, 'era')
      .leftJoinAndSelect('era.roomSchedule', 'rs')
      .leftJoinAndSelect('rs.room', 'room')
      .leftJoinAndSelect('rs.shift_template', 'shiftTemplate')
      .where('era.employeeId = :employeeId', { employeeId })
      .andWhere('era.isActive = :isActive', { isActive: true })
      .andWhere('rs.work_date = :workDate', { workDate: currentDateString })
      .andWhere('rs.actual_start_time::TIME <= :currentTime::TIME', {
        currentTime: currentTimeString,
      })
      .andWhere('rs.actual_end_time::TIME >= :currentTime::TIME', {
        currentTime: currentTimeString,
      })
      .getMany();
  }
  async findByRoomInCurrentSession(
    roomId: string
  ): Promise<EmployeeRoomAssignment[]> {
    const currentDateString = moment().format('YYYY-MM-DD');
    const currentTimeString = moment().format('HH:mm:ss');
    return await this.entityManager
      .createQueryBuilder(EmployeeRoomAssignment, 'era')
      .leftJoinAndSelect('era.roomSchedule', 'rs')
      .leftJoinAndSelect('rs.room', 'room')
      .leftJoinAndSelect('rs.shift_template', 'shiftTemplate')
      .where('rs.room_id = :roomId', { roomId })
      .andWhere('era.isActive = :isActive', { isActive: true })
      .andWhere('rs.work_date = :workDate', { workDate: currentDateString })
      .andWhere('rs.actual_start_time::TIME <= :currentTime::TIME', {
        currentTime: currentTimeString,
      })
      .andWhere('rs.actual_end_time::TIME >= :currentTime::TIME', {
        currentTime: currentTimeString,
      })
      .getMany();
  }

  async findCurrentEmployeeRoomAssignment(
    userId: string
  ): Promise<EmployeeRoomAssignment | null> {
    console.log('userId', userId);
    const now = moment();
    const currentDate = now.format('YYYY-MM-DD');
    const yesterdayDate = now.clone().subtract(1, 'day').format('YYYY-MM-DD');
    const currentTime = now.format('HH:mm:ss');

    const repository = await this.getRepository();

    const qb = repository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.roomSchedule', 'rs')
      .leftJoinAndSelect('rs.room', 'room')
      .innerJoinAndSelect('assignment.employee', 'employee')
      .where('employee.id = :userId', { userId })
      .andWhere(
        `(
          (rs.work_date = :currentDate
            AND rs.actual_start_time IS NOT NULL
            AND rs.actual_end_time IS NOT NULL
            AND (
              (rs.actual_start_time > rs.actual_end_time 
                AND (rs.actual_start_time < :currentTime OR rs.actual_end_time > :currentTime)
              ) 
              OR 
              (rs.actual_start_time <= rs.actual_end_time 
                AND rs.actual_start_time <= :currentTime 
                AND rs.actual_end_time >= :currentTime
              )
            )
          )
          OR 
          (rs.work_date = :yesterdayDate
            AND rs.actual_start_time IS NOT NULL
            AND rs.actual_end_time IS NOT NULL
            AND rs.actual_start_time > rs.actual_end_time
            AND :currentTime <= rs.actual_end_time
          )
        )`,
        { currentDate, yesterdayDate, currentTime }
      );

    const employeeRoomAssignment = await qb.getOne();
    return employeeRoomAssignment;
  }

  async findEmployeeRoomAssignmentForEmployeeInWorkDate(data: {
    id: string;
    work_date: Date | string;
  }): Promise<EmployeeRoomAssignment[]> {
    const repository = this.getRepository();

    const workDateValue =
      data.work_date instanceof Date
        ? data.work_date?.toISOString().split('T')[0]
        : data.work_date;

    const qb = repository
      .createQueryBuilder('era')
      .leftJoinAndSelect('era.roomSchedule', 'roomSchedule')
      .leftJoinAndSelect('roomSchedule.room', 'room')
      .where('era.employeeId = :employeeId', { employeeId: data.id })
      .andWhere('roomSchedule.work_date = :work_date', {
        work_date: workDateValue,
      })
      .orderBy('roomSchedule.actual_start_time', 'ASC');

    return await qb.getMany();
  }
}
