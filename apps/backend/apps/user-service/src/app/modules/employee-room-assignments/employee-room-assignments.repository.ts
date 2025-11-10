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
