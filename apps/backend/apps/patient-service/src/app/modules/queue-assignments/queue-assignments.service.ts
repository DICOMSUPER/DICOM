import { Injectable } from '@nestjs/common';
import { CreateQueueAssignmentDto } from './dto/create-queue-assignment.dto';
import { UpdateQueueAssignmentDto } from './dto/update-queue-assignment.dto';

@Injectable()
export class QueueAssignmentsService {
  create(createQueueAssignmentDto: CreateQueueAssignmentDto) {
    return 'This action adds a new queueAssignment';
  }

  findAll() {
    return `This action returns all queueAssignments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} queueAssignment`;
  }

  update(id: number, updateQueueAssignmentDto: UpdateQueueAssignmentDto) {
    return `This action updates a #${id} queueAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} queueAssignment`;
  }
}
