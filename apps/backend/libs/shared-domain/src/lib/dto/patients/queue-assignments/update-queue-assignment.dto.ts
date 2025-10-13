import { PartialType } from '@nestjs/mapped-types';
import { CreateQueueAssignmentDto } from './create-queue-assignment.dto';

export class UpdateQueueAssignmentDto extends PartialType(CreateQueueAssignmentDto) {}
