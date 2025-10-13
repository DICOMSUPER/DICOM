import { IsOptional, IsUUID, IsEnum, IsInt } from 'class-validator';

import { RepositoryPaginationDto } from '@backend/database';
import { QueuePriorityLevel, QueueStatus } from '@backend/shared-enums';

export class FilterQueueAssignmentDto extends RepositoryPaginationDto {
  @IsOptional()
  @IsUUID()
  roomId?: string;
  @IsOptional()
  @IsEnum(QueueStatus)
  status?: QueueStatus;
  @IsOptional()
  @IsUUID()
  patientId?: string;
  @IsEnum(QueuePriorityLevel)
  @IsOptional()
  priority?: QueuePriorityLevel;
  @IsOptional()
  @IsUUID()
  encounterId?: string;
  @IsOptional()
  assignmentDateFrom?: Date;
  @IsOptional()
  assignmentDateTo?: Date;
  @IsOptional()
  @IsInt()
  queueNumber?: number;
}
