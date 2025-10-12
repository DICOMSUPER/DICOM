import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QueueAssignmentService } from './queue-assignments.service';
import { CreateQueueAssignmentDto } from '@backend/shared-domain';
import { UpdateQueueAssignmentDto } from '@backend/shared-domain';
import type { QueueAssignment, PaginatedResponseDto } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';

@Controller()
export class QueueAssignmentController {
  constructor(private readonly queueAssignmentService: QueueAssignmentService) {}

  @MessagePattern('PatientService.QueueAssignment.Create')
  create(@Payload() createQueueAssignmentDto: CreateQueueAssignmentDto) {
    console.log(createQueueAssignmentDto);
    
    return this.queueAssignmentService.create(createQueueAssignmentDto);
  } 

@MessagePattern('PatientService.QueueAssignment.FindManyInRoom')
findByRoom(@Payload() data: { filterQueue: RepositoryPaginationDto; userId: string }) {
  return this.queueAssignmentService.getAllInRoom(data.filterQueue, data.userId);
}

  @MessagePattern('PatientService.QueueAssignment.FindMany')
  findMany(@Payload() paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<QueueAssignment>> {
    return this.queueAssignmentService.findMany(paginationDto);
  }

  @MessagePattern('PatientService.QueueAssignment.GetStats')
  getStats() {
    return this.queueAssignmentService.getStats();
  }

  @MessagePattern('PatientService.QueueAssignment.FindOne')
  findOne(@Payload() data: { id: string }) {
    return this.queueAssignmentService.findOne(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.Update')
  update(@Payload() data: { id: string; updateQueueAssignmentDto: UpdateQueueAssignmentDto }) {
    return this.queueAssignmentService.update(data.id, data.updateQueueAssignmentDto);
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
    return this.queueAssignmentService.callNextPatient(data.roomId, data.calledBy);
  }

  @MessagePattern('PatientService.QueueAssignment.ValidateToken')
  validateToken(@Payload() data: { token: string }) {
    return this.queueAssignmentService.validateToken(data.token);
  }

  @MessagePattern('PatientService.QueueAssignment.GetEstimatedWaitTime')
  getEstimatedWaitTime(@Payload() data: { id: string }) {
    return this.queueAssignmentService.getEstimatedWaitTime(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.AutoExpire')
  autoExpireAssignments() {
    return this.queueAssignmentService.autoExpireAssignments();
  }
}
