import { Injectable } from '@nestjs/common';
import { Between, EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { QueueAssignment } from '../entities/patients/queue-assignments.entity';
import { QueueStatus, QueuePriorityLevel } from '@backend/shared-enums';
import { FilterQueueAssignmentDto } from '../dto';

export interface QueueAssignmentSearchFilters {
  status?: QueueStatus;
  priority?: QueuePriorityLevel;
  roomId?: string;
  createdBy?: string;
  assignmentDateFrom?: Date;
  assignmentDateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface QueueStats {
  total: number;
  waiting: number;
  inProgress: number;
  completed: number;
  expired: number;
  byPriority: {
    routine: number;
    urgent: number;
    stat: number;
  };
}

@Injectable()
export class QueueAssignmentRepository extends BaseRepository<QueueAssignment> {
  constructor(entityManager: EntityManager) {
    super(QueueAssignment, entityManager);
  }

  async getNextQueueNumberForPhysician(
    date: Date,
    physicianId: string
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const lastAssignment = await this.getRepository()
      .createQueryBuilder('queue')
      .leftJoin('queue.encounter', 'encounter')
      .where('encounter.assignedPhysicianId = :physicianId', { physicianId })
      .andWhere('queue.assignmentDate BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .orderBy('queue.queueNumber', 'DESC')
      .getOne();

    return lastAssignment ? lastAssignment.queueNumber + 1 : 1;
  }

  /**
   * Find all queue assignments with optional filters
   */
  async findAllWithFilters(
    filters: QueueAssignmentSearchFilters = {}
  ): Promise<QueueAssignment[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('1=1');

    if (filters.status) {
      queryBuilder.andWhere('queue.status = :status', {
        status: filters.status,
      });
    }

    if (filters.priority) {
      queryBuilder.andWhere('queue.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.roomId) {
      queryBuilder.andWhere('queue.roomId = :roomId', {
        roomId: filters.roomId,
      });
    }

    if (filters.createdBy) {
      queryBuilder.andWhere('queue.createdBy = :createdBy', {
        createdBy: filters.createdBy,
      });
    }

    if (filters.assignmentDateFrom) {
      queryBuilder.andWhere('queue.assignmentDate >= :assignmentDateFrom', {
        assignmentDateFrom: filters.assignmentDateFrom,
      });
    }

    if (filters.assignmentDateTo) {
      queryBuilder.andWhere('queue.assignmentDate <= :assignmentDateTo', {
        assignmentDateTo: filters.assignmentDateTo,
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder
      .orderBy('queue.priority', 'DESC')
      .addOrderBy('queue.assignmentDate', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Find queue assignment by ID with relations
   */
  async findByIdWithRelations(id: string): Promise<QueueAssignment | null> {
    return await this.findOne({ where: { id } }, [
      'encounter',
      'encounter.patient',
    ]);
  }

  /**
   * Find queue assignment by encounter ID
   */
  async findByEncounterId(
    encounterId: string
  ): Promise<QueueAssignment | null> {
    return await this.findOne({ where: { encounter: { id: encounterId } } }, [
      'encounter',
      'encounter.patient',
    ]);
  }

  /**
   * Delete queue assignment (hard delete)
   */
  async deleteQueueAssignment(id: string): Promise<boolean> {
    const result = await this.getRepository().delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Complete queue assignment
   */
  async complete(id: string): Promise<QueueAssignment | null> {
    await this.getRepository().update(id, {
      status: QueueStatus.COMPLETED,
      updatedAt: new Date(),
    });
    return await this.findByIdWithRelations(id);
  }

  /**
   * Expire queue assignment
   */
  async expire(id: string): Promise<QueueAssignment | null> {
    await this.getRepository().update(id, {
      status: QueueStatus.EXPIRED,
      updatedAt: new Date(),
    });
    return await this.findByIdWithRelations(id);
  }

  /**
   * Get next queue number for a given date
   */
  async getNextQueueNumber(date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const lastAssignment = await this.getRepository().findOne({
      where: {
        assignmentDate: Between(startOfDay, endOfDay),
      },
      order: { queueNumber: 'DESC' },
    });

    return lastAssignment ? lastAssignment.queueNumber + 1 : 1;
  }

  /**
   * Find assignment by validation token
   */
  // async findByValidationToken(validationToken: string): Promise<QueueAssignment | null> {
  //   return await this.findOne(
  //     { where: { validationToken } },
  //     ['encounter', 'encounter.patient']
  //   );
  // }

  /**
   * Find expired assignments
   */
  async findExpiredAssignments(): Promise<QueueAssignment[]> {
    const now = new Date();
    return await this.findAll(
      {
        where: {
          status: QueueStatus.WAITING,
          assignmentExpiresDate: { $lt: now } as any,
        },
      },
      ['encounter', 'encounter.patient']
    );
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    const total = await this.getRepository().count();

    const waiting = await this.getRepository().count({
      where: { status: QueueStatus.WAITING },
    });

    const inProgress = await this.getRepository().count({
      where: { status: QueueStatus.IN_PROGRESS },
    });

    const completed = await this.getRepository().count({
      where: { status: QueueStatus.COMPLETED },
    });

    const expired = await this.getRepository().count({
      where: { status: QueueStatus.EXPIRED },
    });

    const routine = await this.getRepository().count({
      where: { priority: QueuePriorityLevel.ROUTINE },
    });

    const urgent = await this.getRepository().count({
      where: { priority: QueuePriorityLevel.URGENT },
    });

    const stat = await this.getRepository().count({
      where: { priority: QueuePriorityLevel.STAT },
    });

    return {
      total,
      waiting,
      inProgress,
      completed,
      expired,
      byPriority: {
        routine,
        urgent,
        stat,
      },
    };
  }

  /**
   * Find assignments by room
   */
  async findByRoom(roomId: string): Promise<QueueAssignment[]> {
    return await this.findAll(
      {
        where: { roomId },
        order: { queueNumber: 'ASC' },
      },
      ['encounter', 'encounter.patient']
    );
  }

  /**
   * Find assignments by physician
   */
  async findByPhysician(physicianId: string): Promise<QueueAssignment[]> {
    return await this.getRepository()
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.assignedPhysicianId = :physicianId', { physicianId })
      .orderBy('queue.priority', 'DESC')
      .addOrderBy('queue.assignmentDate', 'ASC')
      .getMany();
  }

  // Find all queue assignments with filters
  async findAllQueue(
    filters: FilterQueueAssignmentDto = {}
  ): Promise<QueueAssignment[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('1=1');

    if (filters.status) {
      queryBuilder.andWhere('queue.status = :status', {
        status: filters.status,
      });
    }

    if (filters.priority) {
      queryBuilder.andWhere('queue.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.roomId) {
      queryBuilder.andWhere('queue.roomId = :roomId', {
        roomId: filters.roomId,
      });
    }

    if (filters.assignmentDateFrom) {
      queryBuilder.andWhere('queue.assignmentDate >= :assignmentDateFrom', {
        assignmentDateFrom: filters.assignmentDateFrom,
      });
    }

    if (filters.assignmentDateTo) {
      queryBuilder.andWhere('queue.assignmentDate <= :assignmentDateTo', {
        assignmentDateTo: filters.assignmentDateTo,
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder
      .orderBy('queue.priority', 'DESC')
      .addOrderBy('queue.assignmentDate', 'ASC');

    return await queryBuilder.getMany();
  }
}
