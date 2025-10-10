import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateQueueAssignmentDto, UpdateQueueAssignmentDto } from '@backend/shared-domain';
import { QueueAssignmentRepository, QueueAssignment } from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { QueueStatus, QueuePriorityLevel } from '@backend/shared-enums';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';

@Injectable()
export class QueueAssignmentService {
  constructor(
    @Inject() private readonly queueRepository: QueueAssignmentRepository,
  ) {}

  create = async (
    createQueueAssignmentDto: CreateQueueAssignmentDto
  ): Promise<QueueAssignment> => {
    // Check if encounter already has an active assignment
    const existingAssignment = await this.queueRepository.findByEncounterId(createQueueAssignmentDto.encounterId);
    if (existingAssignment && existingAssignment.status === QueueStatus.WAITING) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Encounter already has an active queue assignment',
        PATIENT_SERVICE
      );
    }

    // Get next queue number for today
    const queueNumber = await this.queueRepository.getNextQueueNumber(new Date());
    
    // Generate unique validation token
    const validationToken = this.generateValidationToken();
    
    // Calculate estimated wait time based on current queue
    const estimatedWaitTime = await this.calculateEstimatedWaitTime(createQueueAssignmentDto.priority);

    const assignmentData = {
      ...createQueueAssignmentDto,
      queueNumber,
      validationToken,
      estimatedWaitTime,
      assignmentDate: new Date(),
      assignmentExpiresDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: QueueStatus.WAITING,
      priority: createQueueAssignmentDto.priority || QueuePriorityLevel.ROUTINE,
    };

    return await this.queueRepository.create(assignmentData);
  };

  findAll = async (): Promise<QueueAssignment[]> => {
    return await this.queueRepository.findAll({ where: {} });
  };

  findOne = async (id: string): Promise<QueueAssignment | null> => {
    const assignment = await this.queueRepository.findById(id);
    if (!assignment) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Failed to find queue assignment',
        PATIENT_SERVICE
      );
    }
    return assignment;
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<QueueAssignment>> => {
    return await this.queueRepository.paginate(paginationDto);
  };

  update = async (
    id: string,
    updateQueueAssignmentDto: UpdateQueueAssignmentDto
  ): Promise<QueueAssignment | null> => {
    const assignment = await this.findOne(id);
    return await this.queueRepository.update(id, {
      ...updateQueueAssignmentDto,
      updatedAt: new Date()
    });
  };

  remove = async (id: string): Promise<boolean> => {
    await this.findOne(id);
    return await this.queueRepository.softDelete(id, 'isDeleted');
  };

  complete = async (id: string): Promise<QueueAssignment | null> => {
    const assignment = await this.findOne(id);
    
    if (assignment.status !== QueueStatus.WAITING && assignment.status !== QueueStatus.IN_PROGRESS) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Only waiting or in-progress assignments can be completed',
        PATIENT_SERVICE
      );
    }

    return await this.queueRepository.complete(id);
  };

  expire = async (id: string): Promise<QueueAssignment | null> => {
    const assignment = await this.findOne(id);
    
    if (assignment.status === QueueStatus.COMPLETED || assignment.status === QueueStatus.EXPIRED) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Assignment is already completed or expired',
        PATIENT_SERVICE
      );
    }

    return await this.queueRepository.expire(id);
  };

  getStats = async () => {
    return await this.queueRepository.getQueueStats();
  };

  findByRoom = async (roomId: string): Promise<QueueAssignment[]> => {
    return await this.queueRepository.findByRoom(roomId);
  };

  findByPhysician = async (physicianId: string): Promise<QueueAssignment[]> => {
    return await this.queueRepository.findByPhysician(physicianId);
  };

  callNextPatient = async (roomId?: string, calledBy?: string): Promise<QueueAssignment | null> => {
    const filters: any = {
      status: QueueStatus.WAITING,
      limit: 1,
      offset: 0
    };

    if (roomId) {
      filters.roomId = roomId;
    }

    // Get next patient by priority and assignment time
    const assignments = await this.queueRepository.findAll(filters);
    if (assignments.length === 0) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'No patients waiting in queue',
        PATIENT_SERVICE
      );
    }

    const nextAssignment = assignments[0];
    
    // Update assignment to IN_PROGRESS and mark as called
    return await this.queueRepository.update(nextAssignment.id, {
      status: QueueStatus.IN_PROGRESS,
      calledAt: new Date(),
      calledBy: calledBy,
      updatedAt: new Date()
    });
  };

  validateToken = async (validationToken: string): Promise<QueueAssignment | null> => {
    const assignment = await this.queueRepository.findByValidationToken(validationToken);
    if (!assignment) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Invalid validation token',
        PATIENT_SERVICE
      );
    }
    
    if (assignment.status === QueueStatus.EXPIRED) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Queue assignment has expired',
        PATIENT_SERVICE
      );
    }

    return assignment;
  };

  getEstimatedWaitTime = async (queueId: string) => {
    const assignment = await this.queueRepository.findById(queueId);
    if (!assignment) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Queue assignment not found',
        PATIENT_SERVICE
      );
    }

    return {
      queueId,
      estimatedWaitTime: assignment.estimatedWaitTime,
      currentPosition: await this.getCurrentPosition(queueId),
      averageWaitTime: await this.getAverageWaitTime()
    };
  };

  autoExpireAssignments = async () => {
    const expiredAssignments = await this.queueRepository.findExpiredAssignments();
    const expiredCount = expiredAssignments.length;

    for (const assignment of expiredAssignments) {
      await this.queueRepository.update(assignment.id, {
        status: QueueStatus.EXPIRED,
        updatedAt: new Date()
      });
    }

    return { expiredCount, assignments: expiredAssignments };
  };

  /**
   * Generate unique validation token
   */
  private generateValidationToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Calculate estimated wait time based on current queue
   */
  private async calculateEstimatedWaitTime(priority?: QueuePriorityLevel): Promise<number> {
    const waitingAssignments = await this.queueRepository.findAll({
      status: QueueStatus.WAITING
    });
    const waitingCount = waitingAssignments.length;

    // Base wait time: 15 minutes per patient
    let baseWaitTime = waitingCount * 15;

    // Adjust based on priority
    switch (priority) {
      case QueuePriorityLevel.STAT:
        baseWaitTime = Math.min(baseWaitTime, 5); // Max 5 minutes for STAT
        break;
      case QueuePriorityLevel.URGENT:
        baseWaitTime = Math.min(baseWaitTime, 10); // Max 10 minutes for URGENT
        break;
      case QueuePriorityLevel.ROUTINE:
      default:
        // Keep calculated time for routine
        break;
    }

    return Math.max(baseWaitTime, 5); // Minimum 5 minutes
  }

  /**
   * Get current position in queue
   */
  private async getCurrentPosition(queueId: string): Promise<number> {
    const assignment = await this.queueRepository.findById(queueId);
    if (!assignment) return 0;

    const waitingAssignments = await this.queueRepository.findAll({
      status: QueueStatus.WAITING
    });
    
    const waitingBefore = waitingAssignments.filter(a => 
      a.assignmentDate < assignment.assignmentDate
    ).length;

    return waitingBefore + 1;
  }

  /**
   * Get average wait time from completed assignments
   */
  private async getAverageWaitTime(): Promise<number> {
    const completedAssignments = await this.queueRepository.findAll({
      status: QueueStatus.COMPLETED,
      limit: 10
    });

    if (completedAssignments.length === 0) return 15; // Default 15 minutes

    const totalWaitTime = completedAssignments.reduce((sum, assignment) => {
      const waitTime = (assignment.updatedAt.getTime() - assignment.assignmentDate.getTime()) / (1000 * 60);
      return sum + waitTime;
    }, 0);

    return Math.round(totalWaitTime / completedAssignments.length);
  }
}
