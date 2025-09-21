import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PriorityLevel, QueueStatus } from '../entities/queue-assignment.entity';

export class CreateQueueAssignmentDto {
  @IsString()
  encounterId!: string;

  @IsString()
  queueNumber!: string;

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsEnum(PriorityLevel)
  @IsOptional()
  priorityLevel?: PriorityLevel;

  @IsString()
  @IsOptional()
  priorityReason?: string;

  @IsEnum(QueueStatus)
  @IsOptional()
  status?: QueueStatus;

  @IsString()
  createdBy!: string;
}

export class UpdateQueueAssignmentDto {
  @IsString()
  @IsOptional()
  roomId?: string;

  @IsEnum(PriorityLevel)
  @IsOptional()
  priorityLevel?: PriorityLevel;

  @IsString()
  @IsOptional()
  priorityReason?: string;

  @IsEnum(QueueStatus)
  @IsOptional()
  status?: QueueStatus;
}


