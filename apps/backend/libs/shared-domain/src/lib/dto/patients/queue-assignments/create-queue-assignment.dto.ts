import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { QueuePriorityLevel } from '@backend/shared-enums';

export class CreateQueueAssignmentDto {
  @IsUUID()
  encounterId: string;

  @IsOptional()
  @IsEnum(QueuePriorityLevel)
  priority?: QueuePriorityLevel;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  priorityReason?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
