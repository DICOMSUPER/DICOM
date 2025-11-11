import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { EmployeeRoomAssignment } from '@backend/shared-domain';
import moment from 'moment';

@Injectable()
export class EmployeeRoomAssignmentRepository extends BaseRepository<EmployeeRoomAssignment> {
  constructor(
    @InjectEntityManager()
    entityManager: EntityManager
  ) {
    super(EmployeeRoomAssignment, entityManager);
  }

  async findByEmployeeInCurrentSession(
    employeeId: string
  ): Promise<EmployeeRoomAssignment[]> {
    const currentDate = new Date();
    console.log('employee id', employeeId);

    // Format date: "2025-11-19"
    const currentDateString = currentDate.toISOString().split('T')[0];

    // Format time: "21:06:12"
    const currentTimeString = currentDate.toTimeString().split(' ')[0];

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
}
