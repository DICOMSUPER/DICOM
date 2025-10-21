import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueueAssignmentService } from './queue-assignments.service';
import {
  CreateQueueAssignmentDto,
  UpdateQueueAssignmentDto,
} from '@backend/shared-domain';
import { QueueAssignment } from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import {
  PATIENT_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';

const moduleName = 'QueueAssignment';
@Controller('queue-assignments')
export class QueueAssignmentController {
  private logger = new Logger(PATIENT_SERVICE);
  constructor(
    private readonly queueAssignmentService: QueueAssignmentService
  ) {}

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() createQueueAssignmentDto: CreateQueueAssignmentDto
  ): Promise<QueueAssignment> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      // const { createQueueAssignmentDto } = data;
      return await this.queueAssignmentService.create(createQueueAssignmentDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create queue assignment',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY_IN_ROOM}`
  )
  findByRoom(
    @Payload() data: { filterQueue: RepositoryPaginationDto; userId: string }
  ) {
    return this.queueAssignmentService.getAllInRoom(
      data.filterQueue,
      data.userId
    );
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<QueueAssignment>> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.queueAssignmentService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 5,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'queueNumber',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many queue assignments',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetStats`)
  async getStats() {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetStats`);
    try {
      return await this.queueAssignmentService.getStats();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get queue assignment stats',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(
    `${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<QueueAssignment | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.queueAssignmentService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find queue assignment with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updateQueueAssignmentDto: UpdateQueueAssignmentDto;
    }
  ): Promise<QueueAssignment | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateQueueAssignmentDto } = data;
      return await this.queueAssignmentService.update(
        id,
        updateQueueAssignmentDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update queue assignment with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Complete`)
  async complete(
    @Payload() data: { id: string }
  ): Promise<QueueAssignment | null> {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.Complete`);
    try {
      const { id } = data;
      return await this.queueAssignmentService.complete(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to complete queue assignment with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Expire`)
  async expire(
    @Payload() data: { id: string }
  ): Promise<QueueAssignment | null> {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.Expire`);
    try {
      const { id } = data;
      return await this.queueAssignmentService.expire(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to expire queue assignment with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`)
  async remove(@Payload() data: { id: string }): Promise<boolean> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`
    );
    try {
      const { id } = data;
      return await this.queueAssignmentService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete queue assignment with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.CallNext`)
  async callNextPatient(
    @Payload() data: { roomId?: string; calledBy?: string }
  ): Promise<QueueAssignment | null> {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.CallNext`);
    try {
      const { roomId, calledBy } = data;
      return await this.queueAssignmentService.callNextPatient(
        roomId,
        calledBy
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to call next patient',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetEstimatedWaitTime`)
  async getEstimatedWaitTime(@Payload() data: { id: string }) {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetEstimatedWaitTime`
    );
    try {
      const { id } = data;
      return await this.queueAssignmentService.getEstimatedWaitTime(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to get estimated wait time for queue: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  // Skip Queue Assignment
  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Skip`)
  async skipAssignment(@Payload() data: { id: string }) {
    this.logger.log(`Using pattern: ${PATIENT_SERVICE}.${moduleName}.Skip`);
    try {
      const { id } = data;
      return await this.queueAssignmentService.skipQueueAssignment(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to skip queue assignment with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  //cron job ?
  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.AutoExpire`)
  async autoExpireAssignments() {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.AutoExpire`
    );
    try {
      return await this.queueAssignmentService.autoExpireAssignments();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to auto-expire queue assignments',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetQueueStatus`)
  async getMaxWaitingAndCurrentInProgressByPhysicians(
    @Payload() data: { userIds: string[] }
  ) {
    try {
      return this.queueAssignmentService.getMaxWaitingAndCurrentInProgressByPhysicians(
        data.userIds
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get queue status',
        PATIENT_SERVICE
      );
    }
  }
}
