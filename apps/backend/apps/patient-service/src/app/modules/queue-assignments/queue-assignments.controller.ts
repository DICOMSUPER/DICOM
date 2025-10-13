<<<<<<< HEAD
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueueAssignmentService } from './queue-assignments.service';
import { CreateQueueAssignmentDto } from '@backend/shared-domain';
import { UpdateQueueAssignmentDto } from '@backend/shared-domain';
import type {
  QueueAssignment,
  PaginatedResponseDto,
} from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';
=======
import {
  Controller,
  Logger,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueueAssignmentService } from './queue-assignments.service';
import { CreateQueueAssignmentDto, UpdateQueueAssignmentDto } from '@backend/shared-domain';
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
>>>>>>> main

const moduleName = 'QueueAssignment';
@Controller('queue-assignments')
export class QueueAssignmentController {
<<<<<<< HEAD
  constructor(
    private readonly queueAssignmentService: QueueAssignmentService
  ) {}

  @MessagePattern('PatientService.QueueAssignment.Create')
  create(@Payload() createQueueAssignmentDto: CreateQueueAssignmentDto) {
    console.log(createQueueAssignmentDto);
    return this.queueAssignmentService.create(createQueueAssignmentDto);
  }

  @MessagePattern('PatientService.QueueAssignment.FindManyInRoom')
  findByRoom(
    @Payload() data: { filterQueue: RepositoryPaginationDto; userId: string }
  ) {
    return this.queueAssignmentService.getAllInRoom(
      data.filterQueue,
      data.userId
    );
  }

  @MessagePattern('PatientService.QueueAssignment.FindMany')
  findMany(
    @Payload() paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<QueueAssignment>> {
    return this.queueAssignmentService.findMany(paginationDto);
=======
  private logger = new Logger(PATIENT_SERVICE);
  constructor(private readonly queueAssignmentService: QueueAssignmentService) {}

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createQueueAssignmentDto: CreateQueueAssignmentDto }
  ): Promise<QueueAssignment> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createQueueAssignmentDto } = data;
      return await this.queueAssignmentService.create(createQueueAssignmentDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create queue assignment',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`)
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
>>>>>>> main
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.GetStats`)
  async getStats() {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.GetStats`
    );
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

<<<<<<< HEAD
  @MessagePattern('PatientService.QueueAssignment.FindOne')
  findOne(@Payload() data: { id: string }) {
    return this.queueAssignmentService.findOne(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.Update')
  update(
=======
  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`)
  async findOne(@Payload() data: { id: string }): Promise<QueueAssignment | null> {
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
>>>>>>> main
    @Payload()
    data: {
      id: string;
      updateQueueAssignmentDto: UpdateQueueAssignmentDto;
    }
<<<<<<< HEAD
  ) {
    return this.queueAssignmentService.update(
      data.id,
      data.updateQueueAssignmentDto
    );
  }

  @MessagePattern('PatientService.QueueAssignment.Complete')
  complete(@Payload() data: { id: string }) {
    return this.queueAssignmentService.complete(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.Expire')
  expire(@Payload() data: { id: string }) {
    return this.queueAssignmentService.expire(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.Delete')
  remove(@Payload() data: { id: string }) {
    return this.queueAssignmentService.remove(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.CallNext')
  callNextPatient(@Payload() data: { roomId?: string; calledBy?: string }) {
    return this.queueAssignmentService.callNextPatient(
      data.roomId,
      data.calledBy
    );
  }

  @MessagePattern('PatientService.QueueAssignment.ValidateToken')
  validateToken(@Payload() data: { token: string }) {
    return this.queueAssignmentService.validateToken(data.token);
  }

  @MessagePattern('PatientService.QueueAssignment.GetEstimatedWaitTime')
  getEstimatedWaitTime(@Payload() data: { id: string }) {
    return this.queueAssignmentService.getEstimatedWaitTime(data.id);
=======
  ): Promise<QueueAssignment | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateQueueAssignmentDto } = data;
      return await this.queueAssignmentService.update(id, updateQueueAssignmentDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update queue assignment with id: ${data.id}`,
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.Complete`)
  async complete(@Payload() data: { id: string }): Promise<QueueAssignment | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.Complete`
    );
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
  async expire(@Payload() data: { id: string }): Promise<QueueAssignment | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.Expire`
    );
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
  async callNextPatient(@Payload() data: { roomId?: string; calledBy?: string }): Promise<QueueAssignment | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.CallNext`
    );
    try {
      const { roomId, calledBy } = data;
      return await this.queueAssignmentService.callNextPatient(roomId, calledBy);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to call next patient',
        PATIENT_SERVICE
      );
    }
  }

  @MessagePattern(`${PATIENT_SERVICE}.${moduleName}.ValidateToken`)
  async validateToken(@Payload() data: { token: string }): Promise<QueueAssignment | null> {
    this.logger.log(
      `Using pattern: ${PATIENT_SERVICE}.${moduleName}.ValidateToken`
    );
    try {
      const { token } = data;
      return await this.queueAssignmentService.validateToken(token);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to validate queue token',
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
>>>>>>> main
  }

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
}
