import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreateEmployeeRoomAssignmentDto,
  EmployeeRoomAssignment,
  FilterEmployeeRoomAssignmentDto,
  RoomSchedule,
  UpdateEmployeeRoomAssignmentDto,
  User,
} from '@backend/shared-domain';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { EmployeeRoomAssignmentRepository } from './employee-room-assignments.repository';

@Injectable()
export class EmployeeRoomAssignmentsService {
  constructor(
    @Inject()
    private readonly employeeRoomAssignmentsRepository: EmployeeRoomAssignmentRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}
  create = async (
    createEmployeeRoomAssignmentDto: CreateEmployeeRoomAssignmentDto
  ): Promise<EmployeeRoomAssignment> => {
    return await this.entityManager.transaction(async (em) => {
      const roomSchedule = await em.findOne(RoomSchedule, {
        where: { schedule_id: createEmployeeRoomAssignmentDto.roomScheduleId },
      });

      if (!roomSchedule) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          `Room schedule with ID ${createEmployeeRoomAssignmentDto.roomScheduleId} not found`,
          'USER_SERVICE'
        );
      }
      const employee = await em.findOne(User, {
        where: { id: createEmployeeRoomAssignmentDto.employeeId },
      });

      if (!employee) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          `Employee with ID ${createEmployeeRoomAssignmentDto.employeeId} not found`,
          'USER_SERVICE'
        );
      }
      const existingAssignment =
        await this.employeeRoomAssignmentsRepository.findOne(
          {
            where: {
              roomScheduleId: createEmployeeRoomAssignmentDto.roomScheduleId,
              employeeId: createEmployeeRoomAssignmentDto.employeeId,
            },
          },
          [],
          em
        );

      if (existingAssignment) {
        throw ThrowMicroserviceException(
          HttpStatus.CONFLICT,
          'Employee is already assigned to this room schedule',
          'USER_SERVICE'
        );
      }
      return await this.employeeRoomAssignmentsRepository.create(
        createEmployeeRoomAssignmentDto,
        em
      );
    });
  };

  findAll = async (
    filter?: FilterEmployeeRoomAssignmentDto
  ): Promise<EmployeeRoomAssignment[]> => {
    const { roomScheduleId, employeeId } = filter || {};
    const where: any = {};
    if (roomScheduleId) {
      where.roomScheduleId = roomScheduleId;
    }
    if (employeeId) {
      where.employeeId = employeeId;
    }

    return await this.employeeRoomAssignmentsRepository.findAll({ where },["employee","roomSchedule"]);
  };
  findByEmployeeInCurrentSession = async (
    employeeId: string
  ): Promise<EmployeeRoomAssignment[]> => {
    return await this.employeeRoomAssignmentsRepository.findByEmployeeInCurrentSession(
      employeeId
    );
  };
  findOne = async (id: string): Promise<EmployeeRoomAssignment | null> => {
    const employeeRoomAssignment =
      await this.employeeRoomAssignmentsRepository.findOne({
        where: { id },
      });

    if (!employeeRoomAssignment) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Employee room assignment not found',
        'USER_SERVICE'
      );
    }

    return employeeRoomAssignment;
  };

  update = async (
    id: string,
    updateEmployeeRoomAssignmentDto: UpdateEmployeeRoomAssignmentDto
  ): Promise<EmployeeRoomAssignment | null> => {
    return await this.entityManager.transaction(async (em) => {
      const assignment = await this.employeeRoomAssignmentsRepository.findOne({
        where: { id },
      });

      if (!assignment) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Employee room assignment not found',
          'USER_SERVICE'
        );
      }

      if (
        updateEmployeeRoomAssignmentDto.roomScheduleId &&
        updateEmployeeRoomAssignmentDto.roomScheduleId !==
          assignment.roomScheduleId
      ) {
        const roomSchedule = await em.findOne(RoomSchedule, {
          where: { room_id: updateEmployeeRoomAssignmentDto.roomScheduleId },
        });

        if (!roomSchedule) {
          throw ThrowMicroserviceException(
            HttpStatus.NOT_FOUND,
            `Room schedule with ID ${updateEmployeeRoomAssignmentDto.roomScheduleId} not found`,
            'USER_SERVICE'
          );
        }
      }

      if (
        updateEmployeeRoomAssignmentDto.employeeId &&
        updateEmployeeRoomAssignmentDto.employeeId !== assignment.employeeId
      ) {
        const employee = await em.findOne(User, {
          where: { id: updateEmployeeRoomAssignmentDto.employeeId },
        });

        if (!employee) {
          throw ThrowMicroserviceException(
            HttpStatus.NOT_FOUND,
            `Employee with ID ${updateEmployeeRoomAssignmentDto.employeeId} not found`,
            'USER_SERVICE'
          );
        }
      }
      const newRoomScheduleId =
        updateEmployeeRoomAssignmentDto.roomScheduleId ||
        assignment.roomScheduleId;
      const newEmployeeId =
        updateEmployeeRoomAssignmentDto.employeeId || assignment.employeeId;
      if (
        newRoomScheduleId !== assignment.roomScheduleId ||
        newEmployeeId !== assignment.employeeId
      ) {
        const existingAssignment =
          await this.employeeRoomAssignmentsRepository.findOne(
            {
              where: {
                roomScheduleId: newRoomScheduleId,
                employeeId: newEmployeeId,
              },
            },
            [],
            em
          );

        if (existingAssignment && existingAssignment.id !== id) {
          throw ThrowMicroserviceException(
            HttpStatus.CONFLICT,
            'Employee is already assigned to this room schedule',
            'USER_SERVICE'
          );
        }
      }
      return await this.employeeRoomAssignmentsRepository.update(
        id,
        updateEmployeeRoomAssignmentDto,
        em
      );
    });
  };
  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      const employeeRoomAssignment =
        await this.employeeRoomAssignmentsRepository.findOne({
          where: { id },
        });

      if (!employeeRoomAssignment) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Employee room assignment not found',
          'USER_SERVICE'
        );
      }

      return await this.employeeRoomAssignmentsRepository.softDelete(
        id,
        'isDeleted'
      );
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<EmployeeRoomAssignment>> => {
    return await this.employeeRoomAssignmentsRepository.paginate(paginationDto);
  };
}
