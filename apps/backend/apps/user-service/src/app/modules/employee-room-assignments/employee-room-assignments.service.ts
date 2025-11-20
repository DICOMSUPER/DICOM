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
  Room,
  RoomStatus,
} from '@backend/shared-domain';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { EmployeeRoomAssignmentRepository } from './employee-room-assignments.repository';

@Injectable()
export class EmployeeRoomAssignmentsService {
  private readonly logger = new Logger(EmployeeRoomAssignmentsService.name);

  constructor(
    @Inject()
    private readonly employeeRoomAssignmentsRepository: EmployeeRoomAssignmentRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  /**
   * Helper method to update room status based on current occupancy and capacity
   */
  private async updateRoomStatusBasedOnCapacity(
    roomId: string,
    em: EntityManager
  ): Promise<void> {
    try {
      const room = await em.findOne(Room, {
        where: { id: roomId },
      });

      if (!room) {
        this.logger.warn(`Room with ID ${roomId} not found for status update`);
        return;
      }

      // Don't update status if room is in maintenance
      if (room.status === RoomStatus.MAINTENANCE) {
        this.logger.log(
          `Room ${room.roomCode} is in maintenance, skipping auto-status update`
        );
        return;
      }

      // Skip if room doesn't have capacity defined
      if (!room.capacity || room.capacity <= 0) {
        this.logger.log(
          `Room ${room.roomCode} has no capacity defined, skipping status update`
        );
        return;
      }

      // Get all active assignments for this room
      // Count assignments from schedules for this room where assignments are active and not deleted
      const occupancyResult = await em
        .createQueryBuilder(EmployeeRoomAssignment, 'assignment')
        .innerJoin('assignment.roomSchedule', 'schedule')
        .where('schedule.room_id = :roomId', { roomId })
        .andWhere('assignment.isActive = :isActive', { isActive: true })
        .getCount();

      const currentOccupancy = occupancyResult || 0;

      // Determine new status based on occupancy
      let newStatus: RoomStatus = room.status;

      if (currentOccupancy >= room.capacity) {
        // Room is at or over capacity
        if (room.status !== RoomStatus.OCCUPIED) {
          newStatus = RoomStatus.OCCUPIED;
          this.logger.log(
            `Room ${room.roomCode} is now OCCUPIED (${currentOccupancy}/${room.capacity})`
          );
        }
      } else if (currentOccupancy === 0) {
        // Room has no assignments
        if (room.status !== RoomStatus.AVAILABLE) {
          newStatus = RoomStatus.AVAILABLE;
          this.logger.log(
            `Room ${room.roomCode} is now AVAILABLE (0/${room.capacity})`
          );
        }
      } else {
        // Room has some assignments but not full
        // Keep current status if it's AVAILABLE or OCCUPIED
        // Only change if it's in an invalid state
        if (
          room.status !== RoomStatus.AVAILABLE &&
          room.status !== RoomStatus.OCCUPIED
        ) {
          newStatus = RoomStatus.AVAILABLE;
          this.logger.log(
            `Room ${room.roomCode} status normalized to AVAILABLE (${currentOccupancy}/${room.capacity})`
          );
        }
      }

      // Update status if it changed
      if (newStatus !== room.status) {
        const oldStatus = room.status;
        room.status = newStatus;
        await em.save(Room, room);
        this.logger.log(
          `✅ Room ${room.roomCode} status updated from ${oldStatus} to ${newStatus}`
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to update room status for room ${roomId}: ${error.message}`
      );
      // Don't throw error - status update failure shouldn't break assignment creation
    }
  }
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

      const createdAssignment = await this.employeeRoomAssignmentsRepository.create(
        createEmployeeRoomAssignmentDto,
        em
      );

      // Update room status based on capacity after assignment is created
      if (roomSchedule.room_id) {
        await this.updateRoomStatusBasedOnCapacity(roomSchedule.room_id, em);
      }

      return createdAssignment;
    });
  };

  createBulk = async (
    assignments: CreateEmployeeRoomAssignmentDto[]
  ): Promise<EmployeeRoomAssignment[]> => {
    return await this.entityManager.transaction(async (em) => {
      const createdAssignments: EmployeeRoomAssignment[] = [];
      const errors: { index: number; message: string }[] = [];
      const roomsToUpdate = new Set<string>();

      for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        try {
          const roomSchedule = await em.findOne(RoomSchedule, {
            where: { schedule_id: assignment.roomScheduleId },
          });

          if (!roomSchedule) {
            errors.push({
              index: i,
              message: `Room schedule with ID ${assignment.roomScheduleId} not found`,
            });
            continue;
          }

          const employee = await em.findOne(User, {
            where: { id: assignment.employeeId },
          });

          if (!employee) {
            errors.push({
              index: i,
              message: `Employee with ID ${assignment.employeeId} not found`,
            });
            continue;
          }

          const existingAssignment =
            await this.employeeRoomAssignmentsRepository.findOne(
              {
                where: {
                  roomScheduleId: assignment.roomScheduleId,
                  employeeId: assignment.employeeId,
                },
              },
              [],
              em
            );

          if (existingAssignment) {
            errors.push({
              index: i,
              message: `Employee ${assignment.employeeId} is already assigned to this room schedule`,
            });
            continue;
          }

          const created = await this.employeeRoomAssignmentsRepository.create(
            assignment,
            em
          );
          createdAssignments.push(created);

          // Track room IDs that need status updates (optimize to update once per room)
          if (roomSchedule.room_id) {
            roomsToUpdate.add(roomSchedule.room_id);
          }
        } catch (error: any) {
          errors.push({
            index: i,
            message: error.message || `Failed to create assignment for employee ${assignment.employeeId}`,
          });
        }
      }

      // Update room status for all affected rooms (once per unique room)
      for (const roomId of roomsToUpdate) {
        await this.updateRoomStatusBasedOnCapacity(roomId, em);
      }

      if (errors.length > 0 && createdAssignments.length === 0) {
        throw ThrowMicroserviceException(
          HttpStatus.BAD_REQUEST,
          `Failed to create any assignments: ${errors.map((e) => e.message).join('; ')}`,
          'USER_SERVICE'
        );
      }

      return createdAssignments;
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
      const assignment = await this.employeeRoomAssignmentsRepository.findOne(
        {
          where: { id },
        },
        ['roomSchedule']
      );

      if (!assignment) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Employee room assignment not found',
          'USER_SERVICE'
        );
      }

      const oldRoomScheduleId = assignment.roomScheduleId;
      const oldRoomId = assignment.roomSchedule?.room_id;

      if (
        updateEmployeeRoomAssignmentDto.roomScheduleId &&
        updateEmployeeRoomAssignmentDto.roomScheduleId !==
          assignment.roomScheduleId
      ) {
        const roomSchedule = await em.findOne(RoomSchedule, {
          where: { schedule_id: updateEmployeeRoomAssignmentDto.roomScheduleId },
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

      const updated = await this.employeeRoomAssignmentsRepository.update(
        id,
        updateEmployeeRoomAssignmentDto,
        em
      );

      // Update room status for both old and new room if assignment was moved
      if (newRoomScheduleId !== oldRoomScheduleId) {
        // Update old room status (assignment was removed from it)
        if (oldRoomId) {
          await this.updateRoomStatusBasedOnCapacity(oldRoomId, em);
        }

        // Update new room status (assignment was added to it)
        const newRoomSchedule = await em.findOne(RoomSchedule, {
          where: { schedule_id: newRoomScheduleId },
        });
        if (newRoomSchedule?.room_id) {
          await this.updateRoomStatusBasedOnCapacity(newRoomSchedule.room_id, em);
        }
      } else if (oldRoomId) {
        // Same room, but update status in case isActive changed
        await this.updateRoomStatusBasedOnCapacity(oldRoomId, em);
      }

      return updated;
    });
  };
  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      const employeeRoomAssignment =
        await this.employeeRoomAssignmentsRepository.findOne(
          {
            where: { id },
          },
          ['roomSchedule']
        );

      if (!employeeRoomAssignment) {
        throw ThrowMicroserviceException(
          HttpStatus.NOT_FOUND,
          'Employee room assignment not found',
          'USER_SERVICE'
        );
      }

      // Get room ID before deletion
      const roomSchedule = employeeRoomAssignment.roomSchedule;
      const roomId = roomSchedule?.room_id;

      const result = await this.employeeRoomAssignmentsRepository.softDelete(
        id,
        'isDeleted'
      );

      // Update room status based on capacity after assignment is removed
      if (roomId) {
        await this.updateRoomStatusBasedOnCapacity(roomId, em);
      }

      return result;
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<EmployeeRoomAssignment>> => {
    return await this.employeeRoomAssignmentsRepository.paginate(paginationDto);
  };

  findCurrentEmployeeAssignment = async (
    userId: string
  ): Promise<EmployeeRoomAssignment | null> => {
    return await this.employeeRoomAssignmentsRepository.findCurrentEmployeeRoomAssignment(
      userId
    );
  };

  findByEmployee = async (
    employeeId: string
  ): Promise<EmployeeRoomAssignment[]> => {
    return await this.employeeRoomAssignmentsRepository.findAll({
      where: { employeeId: employeeId, isDeleted: false },
    });
  };
}
