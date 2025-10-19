import {
  CreateQueueAssignmentDto,
  UpdateQueueAssignmentDto,
  FilterQueueAssignmentDto,
  QueueAssignment,
  QueueAssignmentRepository,
} from '@backend/shared-domain';

import { QueueStatus, QueuePriorityLevel, Roles } from '@backend/shared-enums';
import { PaginationService } from '@backend/database';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';

import { ThrowMicroserviceException } from '@backend/shared-utils';
import { PATIENT_SERVICE } from '../../../constant/microservice.constant';

@Injectable()
export class QueueAssignmentService {
  constructor(
    private readonly queueRepository: QueueAssignmentRepository,
    private readonly paginationService: PaginationService,
    @Inject(process.env.USER_SERVICE_NAME || 'UserService')
    private readonly userService: ClientProxy
  ) {}

  private getEndOfDay(date: Date = new Date()): Date {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  create = async (
    createQueueAssignmentDto: CreateQueueAssignmentDto
  ): Promise<QueueAssignment> => {
    // Check if encounter already has an active assignment
    if (!createQueueAssignmentDto.encounterId) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'EncounterId is required',
        PATIENT_SERVICE
      );
    }

    const existingAssignment = await this.queueRepository.findByEncounterId(
      createQueueAssignmentDto.encounterId
    );
    if (
      existingAssignment &&
      existingAssignment.status === QueueStatus.WAITING
    ) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Encounter already has an active queue assignment',
        PATIENT_SERVICE
      );
    }

    // Get next queue number for today
    const queueNumber = await this.queueRepository.getNextQueueNumber(
      new Date()
    );

    // Calculate estimated wait time based on current queue
    const estimatedWaitTime = await this.calculateEstimatedWaitTime(
      createQueueAssignmentDto.priority
    );

    const assignmentData = {
      ...createQueueAssignmentDto,
      queueNumber,
      estimatedWaitTime,
      assignmentDate: new Date(),
      assignmentExpiresDate: this.getEndOfDay(),
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
    // const assignment = await this.findOne(id);
    return await this.queueRepository.update(id, {
      ...updateQueueAssignmentDto,
      updatedAt: new Date(),
    });
  };

  remove = async (id: string): Promise<boolean> => {
    await this.findOne(id);
    return await this.queueRepository.softDelete(id, 'isDeleted');
  };

  complete = async (id: string): Promise<QueueAssignment | null> => {
    const assignment = await this.findOne(id);
    if (!assignment) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Assignment not found',
        PATIENT_SERVICE
      );
    }
    if (
      assignment.status !== QueueStatus.WAITING &&
      assignment.status !== QueueStatus.IN_PROGRESS
    ) {
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

    if (!assignment) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Queue Assignment not found',
        PATIENT_SERVICE
      );
    }

    if (
      assignment.status === QueueStatus.COMPLETED ||
      assignment.status === QueueStatus.EXPIRED
    ) {
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

  callNextPatient = async (
    userId?: string,
    calledBy?: string
  ): Promise<QueueAssignment | null> => {
    const user = await firstValueFrom(
      this.userService.send('UserService.Users.findOne', { userId })
    );

    if (!user) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        `User with ID ${userId} not found`,
        PATIENT_SERVICE
      );
    }

    if (user.role !== Roles.PHYSICIAN) {
      throw ThrowMicroserviceException(
        HttpStatus.FORBIDDEN,
        `User with ID ${userId} is not authorized to call patients`,
        PATIENT_SERVICE
      );
    }
    //
    const filters: any = {
      status: QueueStatus.WAITING,
      limit: 1,
      offset: 0,
    };

    if (userId) {
      filters.userId = userId;
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

    return await this.queueRepository.update(nextAssignment.id, {
      status: QueueStatus.IN_PROGRESS,
      calledAt: new Date(),
      calledBy: calledBy,
      updatedAt: new Date(),
    });
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
      averageWaitTime: await this.getAverageWaitTime(),
    };
  };

  autoExpireAssignments = async () => {
    const expiredAssignments =
      await this.queueRepository.findExpiredAssignments();
    const expiredCount = expiredAssignments.length;

    for (const assignment of expiredAssignments) {
      await this.queueRepository.update(assignment.id, {
        status: QueueStatus.EXPIRED,
        updatedAt: new Date(),
      });
    }

    return { expiredCount, assignments: expiredAssignments };
  };

  /**
   * Calculate estimated wait time based on current queue
   */
  private async calculateEstimatedWaitTime(
    priority?: QueuePriorityLevel
  ): Promise<number> {
    const waitingAssignments = await this.queueRepository.findAll({
      where: { status: QueueStatus.WAITING },
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
      where: { status: QueueStatus.WAITING },
    });

    const waitingBefore = waitingAssignments.filter(
      (a) => a.assignmentDate < assignment.assignmentDate
    ).length;

    return waitingBefore + 1;
  }

  /**
   * Get average wait time from completed assignments
   */
  private async getAverageWaitTime(): Promise<number> {
    const completedAssignments = await this.queueRepository.findAll({
      where: { status: QueueStatus.COMPLETED },
      take: 10,
    });

    if (completedAssignments.length === 0) return 15; // Default 15 minutes

    const totalWaitTime = completedAssignments.reduce((sum, assignment) => {
      const waitTime =
        (assignment.updatedAt.getTime() - assignment.assignmentDate.getTime()) /
        (1000 * 60);
      return sum + waitTime;
    }, 0);

    return Math.round(totalWaitTime / completedAssignments.length);
  }

  // Get all queue assignments in a specific room
  async getAllInRoom(
    filterQueue: FilterQueueAssignmentDto,
    userId: string
  ): Promise<PaginatedResponseDto<QueueAssignment>> {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignmentDateFrom,
      assignmentDateTo,
      queueNumber,
    } = filterQueue;
    const whereConditions: any = {};

    const user = await firstValueFrom(
      this.userService.send('UserService.Users.findOne', { userId })
    );
    console.log('queue physician', user);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== Roles.PHYSICIAN) {
      throw new NotFoundException(
        `User with ID ${userId} is not authorized to view room assignments`
      );
    }

    whereConditions.encounter = {
      assignedPhysicianId: userId,
    };

    if (status) {
      whereConditions.status = status;
    }
    if (queueNumber) {
      whereConditions.queueNumber = queueNumber;
    }

    // Filter by priority if provided
    if (priority) {
      whereConditions.priority = priority;
    }

    // tam thoi
    // if (!assignmentDateFrom && !assignmentDateTo) {
    //   const startOfDay = new Date();
    //   startOfDay.setHours(0, 0, 0, 0);

    //   const endOfDay = this.getEndOfDay();

    //   whereConditions.assignmentDate = {
    //     gte: startOfDay,
    //     lte: endOfDay,
    //   };
    // } else {
    //   whereConditions.assignmentDate = {};
    //   if (assignmentDateFrom) {
    //     whereConditions.assignmentDate.gte = new Date(assignmentDateFrom);
    //   }
    //   if (assignmentDateTo) {
    //     const endDate = new Date(assignmentDateTo);
    //     endDate.setHours(23, 59, 59, 999); // End of day
    //     whereConditions.assignmentDate.lte = endDate;
    //   }
    // }

    // ✅ Get data without sorting first
    const result = await this.paginationService.paginate(
      QueueAssignment,
      { page, limit },
      {
        where: { ...whereConditions },
        relations: {
          encounter: {
            patient: true,
          },
        },
      }
    );

    // ✅ Custom sort: Active statuses first, then completed/expired
    if (result.data && result.data.length > 0) {
      result.data.sort((a, b) => {
        // Define status priority (lower number = higher priority)
        const getStatusPriority = (status: QueueStatus) => {
          switch (status) {
            case QueueStatus.IN_PROGRESS:
              return 0;
            case QueueStatus.WAITING:
              return 1;
            case QueueStatus.COMPLETED:
              return 2; // Lower priority
            case QueueStatus.EXPIRED:
              return 3; // Lowest priority
            default:
              return 4;
          }
        };

        const statusPriorityA = getStatusPriority(a.status);
        const statusPriorityB = getStatusPriority(b.status);
        if (statusPriorityA !== statusPriorityB) {
          return statusPriorityA - statusPriorityB;
        }

        const getPriorityValue = (priority: QueuePriorityLevel) => {
          switch (priority) {
            case QueuePriorityLevel.STAT:
              return 0;
            case QueuePriorityLevel.URGENT:
              return 1;
            case QueuePriorityLevel.ROUTINE:
              return 2;
            default:
              return 3;
          }
        };
        if (
          a.status === QueueStatus.WAITING &&
          b.status === QueueStatus.WAITING
        ) {
          if (!a.skippedAt && b.skippedAt) return -1;
          if (a.skippedAt && !b.skippedAt) return 1;
          if (a.skippedAt && b.skippedAt) {
            return a.skippedAt.getTime() - b.skippedAt.getTime();
          }
        }

        const priorityA = getPriorityValue(a.priority);
        const priorityB = getPriorityValue(b.priority);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Finally, sort by queue number
        return a.queueNumber - b.queueNumber;
      });
    }

    return result;
  }

  skipQueueAssignment = async (id: string): Promise<QueueAssignment | null> => {
    const assignment = await this.findOne(id);

    if (!assignment) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Queue Assignment not found',
        PATIENT_SERVICE
      );
    }

    if (assignment.status !== QueueStatus.WAITING) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Only waiting assignments can be skipped',
        PATIENT_SERVICE
      );
    }

    return await this.queueRepository.update(id, {
      skippedAt: new Date(),
      updatedAt: new Date(),
    });
  }

}
