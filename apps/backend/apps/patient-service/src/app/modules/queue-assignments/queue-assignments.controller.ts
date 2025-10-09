import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { QueueAssignmentService } from './queue-assignments.service';
import { CreateQueueAssignmentDto } from './dto/create-queue-assignment.dto';
import { UpdateQueueAssignmentDto } from './dto/update-queue-assignment.dto';
import type { QueueAssignmentResponseDto, PaginatedResponseDto } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';

@Controller()
export class QueueAssignmentController {
  constructor(private readonly queueAssignmentService: QueueAssignmentService) {}

  @MessagePattern('PatientService.QueueAssignment.Create')
  create(createQueueAssignmentDto: CreateQueueAssignmentDto) {
    return this.queueAssignmentService.create(createQueueAssignmentDto);
  }

  @MessagePattern('PatientService.QueueAssignment.FindMany')
  findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<QueueAssignmentResponseDto>> {
    return this.queueAssignmentService.findMany(paginationDto);
  }

  @MessagePattern('PatientService.QueueAssignment.GetStats')
  getStats() {
    return this.queueAssignmentService.getStats();
  }

  @MessagePattern('PatientService.QueueAssignment.FindOne')
  findOne(data: { id: string }) {
    return this.queueAssignmentService.findOne(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.Update')
  update(data: { id: string; updateQueueAssignmentDto: UpdateQueueAssignmentDto }) {
    return this.queueAssignmentService.update(data.id, data.updateQueueAssignmentDto);
  }

  @MessagePattern('PatientService.QueueAssignment.Complete')
  complete(data: { id: string }) {
    return this.queueAssignmentService.complete(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.Expire')
  expire(data: { id: string }) {
    return this.queueAssignmentService.expire(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.Delete')
  remove(data: { id: string }) {
    return this.queueAssignmentService.remove(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.CallNext')
  callNextPatient(data: { roomId?: string; calledBy?: string }) {
    return this.queueAssignmentService.callNextPatient(data.roomId, data.calledBy);
  }

  @MessagePattern('PatientService.QueueAssignment.ValidateToken')
  validateToken(data: { token: string }) {
    return this.queueAssignmentService.validateToken(data.token);
  }

  @MessagePattern('PatientService.QueueAssignment.GetEstimatedWaitTime')
  getEstimatedWaitTime(data: { id: string }) {
    return this.queueAssignmentService.getEstimatedWaitTime(data.id);
  }

  @MessagePattern('PatientService.QueueAssignment.AutoExpire')
  autoExpireAssignments() {
    return this.queueAssignmentService.autoExpireAssignments();
  }
}
