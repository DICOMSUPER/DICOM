import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { EncounterPriorityLevel, EncounterStatus } from '@backend/shared-enums';
import { PaginationDto } from '@backend/database';

export class FilterPatientEncounterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Encounter ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @ApiPropertyOptional({
    description: 'Encounter status',
    enum: EncounterStatus,
  })
  @IsOptional()
  @IsEnum(EncounterStatus)
  status?: EncounterStatus;

  @ApiPropertyOptional({
    description: 'Encounter priority level',
    enum: EncounterPriorityLevel,
  })
  @IsOptional()
  @IsEnum(EncounterPriorityLevel)
  priority?: EncounterPriorityLevel;

  @ApiPropertyOptional({ description: 'Room id' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Room code' })
  @IsOptional()
  @IsString()
  roomCode?: string;

  @ApiPropertyOptional({ description: 'Created by user ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Patient code' })
  @IsOptional()
  @IsString()
  patientCode?: string;

  @ApiPropertyOptional({ description: 'Patient name' })
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional({
    description: 'Assignment date from',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  encounterDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Assignment date to',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  encounterDateTo?: string;

  @ApiPropertyOptional({ description: 'Order number' })
  @IsOptional()
  @IsNumber()
  orderNumber?: number;
  
  @ApiPropertyOptional({ description: 'Assigned physician ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  assignedPhysicianId?: string;
}
