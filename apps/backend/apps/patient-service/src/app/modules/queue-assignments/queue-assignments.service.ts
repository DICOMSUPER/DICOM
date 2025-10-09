import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateQueueAssignmentDto } from './dto/create-queue-assignment.dto';
import { UpdateQueueAssignmentDto } from './dto/update-queue-assignment.dto';
import { QueueAssignmentRepository, QueueAssignmentResponseDto, PaginatedResponseDto } from '@backend/shared-domain';
import { QueueStatus, QueuePriorityLevel } from '@backend/shared-enums';
import { RepositoryPaginationDto } from '@backend/database';

@Injectable()
export class QueueAssignmentService {
  constructor(
    private readonly queueRepository: QueueAssignmentRepository,
  ) {}

  async create(createQueueAssignmentDto: CreateQueueAssignmentDto) {
    // Check if encounter already has an active assignment
    const existingAssignment = await this.queueRepository.findByEncounterId(createQueueAssignmentDto.encounterId);
    if (existingAssignment && existingAssignment.status === QueueStatus.WAITING) {
      throw new BadRequestException('Encounter already has an active queue assignment');
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
  }

  async findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<QueueAssignmentResponseDto>> {
    const result = await this.queueRepository.findWithPagination(paginationDto);
    return {
      data: result.data.map((assignment: any) => this.mapToResponseDto(assignment)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage
    };
  }

  async findOne(id: string) {
    const assignment = await this.queueRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException(`Queue assignment with ID ${id} not found`);
    }
    return assignment;
  }

  async update(id: string, updateQueueAssignmentDto: UpdateQueueAssignmentDto) {
    await this.findOne(id); // Verify assignment exists
    
    const updatedAssignment = await this.queueRepository.update(id, {
      ...updateQueueAssignmentDto,
      updatedAt: new Date()
    });

    return updatedAssignment;
  }

  async remove(id: string) {
    await this.findOne(id); // Verify assignment exists
    
    const deleted = await this.queueRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Failed to delete queue assignment with ID ${id}`);
    }

    return { message: 'Queue assignment deleted successfully' };
  }

  async complete(id: string) {
    const assignment = await this.findOne(id);
    
    if (assignment.status !== QueueStatus.WAITING && assignment.status !== QueueStatus.IN_PROGRESS) {
      throw new BadRequestException('Only waiting or in-progress assignments can be completed');
    }

    return await this.queueRepository.complete(id);
  }

  async expire(id: string) {
    const assignment = await this.findOne(id);
    
    if (assignment.status === QueueStatus.COMPLETED || assignment.status === QueueStatus.EXPIRED) {
      throw new BadRequestException('Assignment is already completed or expired');
    }

    return await this.queueRepository.expire(id);
  }

  async getStats() {
    return await this.queueRepository.getQueueStats();
  }

  async findByRoom(roomId: string) {
    return await this.queueRepository.findByRoom(roomId);
  }

  async findByPhysician(physicianId: string) {
    return await this.queueRepository.findByPhysician(physicianId);
  }

  /**
   * Call next patient in queue
   */
  async callNextPatient(roomId?: string, calledBy?: string) {
    const filters: QueueAssignmentSearchFilters = {
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
      throw new NotFoundException('No patients waiting in queue');
    }

    const nextAssignment = assignments[0];
    
    // Update assignment to IN_PROGRESS and mark as called
    return await this.queueRepository.update(nextAssignment.id, {
      status: QueueStatus.IN_PROGRESS,
      calledAt: new Date(),
      calledBy: calledBy,
      updatedAt: new Date()
    });
  }

  /**
   * Validate queue token
   */
  async validateToken(validationToken: string) {
    const assignment = await this.queueRepository.findByValidationToken(validationToken);
    if (!assignment) {
      throw new NotFoundException('Invalid validation token');
    }
    
    if (assignment.status === QueueStatus.EXPIRED) {
      throw new BadRequestException('Queue assignment has expired');
    }

    return assignment;
  }

  /**
   * Get estimated wait time for a patient
   */
  async getEstimatedWaitTime(queueId: string) {
    const assignment = await this.queueRepository.findById(queueId);
    if (!assignment) {
      throw new NotFoundException('Queue assignment not found');
    }

    return {
      queueId,
      estimatedWaitTime: assignment.estimatedWaitTime,
      currentPosition: await this.getCurrentPosition(queueId),
      averageWaitTime: await this.getAverageWaitTime()
    };
  }

  /**
   * Auto-expire old assignments (should be called by cron job)
   */
  async autoExpireAssignments() {
    const expiredAssignments = await this.queueRepository.findExpiredAssignments();
    const expiredCount = expiredAssignments.length;

    for (const assignment of expiredAssignments) {
      await this.queueRepository.update(assignment.id, {
        status: QueueStatus.EXPIRED,
        updatedAt: new Date()
      });
    }

    return { expiredCount, assignments: expiredAssignments };
  }

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
