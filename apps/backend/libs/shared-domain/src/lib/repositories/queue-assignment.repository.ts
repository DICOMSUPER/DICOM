import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Between } from 'typeorm';
import { QueueAssignment } from '../entities/patients/queue-assignments.entity';
import { QueueStatus, QueuePriorityLevel } from '@backend/shared-enums';

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
export class QueueAssignmentRepository {
  constructor(
    @InjectRepository(QueueAssignment)
    private readonly queueRepository: Repository<QueueAssignment>,
  ) {}

  /**
   * Create a new queue assignment
   */
  async create(assignmentData: Partial<QueueAssignment>): Promise<QueueAssignment> {
    const assignment = this.queueRepository.create(assignmentData);
    return await this.queueRepository.save(assignment);
  }

  /**
   * Find all queue assignments with optional filters
   */
  async findAll(filters: QueueAssignmentSearchFilters = {}): Promise<QueueAssignment[]> {
    const queryBuilder = this.queueRepository
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('queue.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.status) {
      queryBuilder.andWhere('queue.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('queue.priority = :priority', { priority: filters.priority });
    }

    if (filters.roomId) {
      queryBuilder.andWhere('queue.roomId = :roomId', { roomId: filters.roomId });
    }

    if (filters.createdBy) {
      queryBuilder.andWhere('queue.createdBy = :createdBy', { createdBy: filters.createdBy });
    }

    if (filters.assignmentDateFrom) {
      queryBuilder.andWhere('queue.assignmentDate >= :assignmentDateFrom', {
        assignmentDateFrom: filters.assignmentDateFrom
      });
    }

    if (filters.assignmentDateTo) {
      queryBuilder.andWhere('queue.assignmentDate <= :assignmentDateTo', {
        assignmentDateTo: filters.assignmentDateTo
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('queue.priority', 'DESC')
      .addOrderBy('queue.assignmentDate', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Find queue assignment by ID
   */
  async findById(id: string): Promise<QueueAssignment | null> {
    return await this.queueRepository.findOne({
      where: { id },
      relations: ['encounter', 'encounter.patient']
    });
  }

  /**
   * Find queue assignment by encounter ID
   */
  async findByEncounterId(encounterId: string): Promise<QueueAssignment | null> {
    return await this.queueRepository.findOne({
      where: { encounter: { id: encounterId } },
      relations: ['encounter', 'encounter.patient']
    });
  }

  /**
   * Update queue assignment
   */
  async update(id: string, updateData: Partial<QueueAssignment>): Promise<QueueAssignment | null> {
    await this.queueRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Delete queue assignment (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.queueRepository.update(id, { isDeleted: true });
    return result.affected > 0;
  }

  /**
   * Complete queue assignment
   */
  async complete(id: string): Promise<QueueAssignment | null> {
    return await this.update(id, { 
      status: QueueStatus.COMPLETED,
      updatedAt: new Date()
    });
  }

  /**
   * Expire queue assignment
   */
  async expire(id: string): Promise<QueueAssignment | null> {
    return await this.update(id, { 
      status: QueueStatus.EXPIRED,
      updatedAt: new Date()
    });
  }

  /**
   * Get next queue number for a given date
   */
  async getNextQueueNumber(date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const lastAssignment = await this.queueRepository.findOne({
      where: {
        assignmentDate: Between(startOfDay, endOfDay)
      },
      order: { queueNumber: 'DESC' }
    });

    return lastAssignment ? lastAssignment.queueNumber + 1 : 1;
  }

  /**
   * Find assignment by validation token
   */
  async findByValidationToken(validationToken: string): Promise<QueueAssignment | null> {
    return await this.queueRepository.findOne({
      where: { validationToken },
      relations: ['encounter', 'encounter.patient']
    });
  }

  /**
   * Find expired assignments
   */
  async findExpiredAssignments(): Promise<QueueAssignment[]> {
    const now = new Date();
    return await this.queueRepository.find({
      where: {
        status: QueueStatus.WAITING,
        assignmentExpiresDate: { $lt: now } as any
      },
      relations: ['encounter', 'encounter.patient']
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    const total = await this.queueRepository.count({
      where: { isDeleted: false }
    });

    const waiting = await this.queueRepository.count({
      where: { status: QueueStatus.WAITING, isDeleted: false }
    });

    const inProgress = await this.queueRepository.count({
      where: { status: QueueStatus.IN_PROGRESS, isDeleted: false }
    });

    const completed = await this.queueRepository.count({
      where: { status: QueueStatus.COMPLETED, isDeleted: false }
    });

    const expired = await this.queueRepository.count({
      where: { status: QueueStatus.EXPIRED, isDeleted: false }
    });

    const routine = await this.queueRepository.count({
      where: { priority: QueuePriorityLevel.ROUTINE, isDeleted: false }
    });

    const urgent = await this.queueRepository.count({
      where: { priority: QueuePriorityLevel.URGENT, isDeleted: false }
    });

    const stat = await this.queueRepository.count({
      where: { priority: QueuePriorityLevel.STAT, isDeleted: false }
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
        stat
      }
    };
  }

  /**
   * Find assignments by room
   */
  async findByRoom(roomId: string): Promise<QueueAssignment[]> {
    return await this.queueRepository.find({
      where: { roomId, isDeleted: false },
      relations: ['encounter', 'encounter.patient'],
      order: { queueNumber: 'ASC' }
    });
  }

  /**
   * Find assignments by physician
   */
  async findByPhysician(physicianId: string): Promise<QueueAssignment[]> {
    return await this.queueRepository
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.assignedPhysicianId = :physicianId', { physicianId })
      .andWhere('queue.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('queue.priority', 'DESC')
      .addOrderBy('queue.assignmentDate', 'ASC')
      .getMany();
  }
}
