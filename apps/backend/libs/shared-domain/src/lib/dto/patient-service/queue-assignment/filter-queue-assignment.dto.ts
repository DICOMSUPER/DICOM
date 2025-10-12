import { IsOptional, IsUUID, IsEnum, IsInt } from 'class-validator';

import { RepositoryPaginationDto } from '@backend/database';
import { QueueStatus } from '@backend/shared-enums';

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
  @IsOptional()
  @IsUUID()
  encounterId?: string;
  @IsOptional()
  dateFrom?: Date;
  @IsOptional()
  dateTo?: Date;
  @IsOptional()
  @IsInt()
  queueNumber?: number;
}
