import { IsOptional, IsUUID, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentType } from '@backend/shared-enums';
import { ApiProperty } from '@nestjs/swagger';

export class QueryRoomAssignmentDto {
  @ApiProperty({ required: false, example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false, example: 'b1e2c3d4-5678-1234-9abc-1234567890ab', description: 'Filter by user UUID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ required: false, example: 'a1b2c3d4-5678-1234-9abc-1234567890cd', description: 'Filter by room UUID' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({ required: false, enum: AssignmentType, example: AssignmentType.PERMANENT, description: 'Filter by assignment type' })
  @IsOptional()
  @IsEnum(AssignmentType)
  assignmentType?: AssignmentType;

  @ApiProperty({ required: false, example: '2024-06-01', description: 'Filter by date from (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false, example: '2024-06-30', description: 'Filter by date to (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
