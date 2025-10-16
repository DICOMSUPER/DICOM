import { IsUUID, IsEnum, IsNotEmpty, IsOptional, IsDateString, IsString, Matches } from 'class-validator';
import { AssignmentType } from '@backend/shared-enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomAssignmentDto {
  @ApiProperty({ example: 'b1e2c3d4-5678-1234-9abc-1234567890ab', description: 'User UUID' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'a1b2c3d4-5678-1234-9abc-1234567890cd', description: 'Room UUID' })
  @IsUUID()
  @IsNotEmpty()
  roomId!: string;

  @ApiProperty({ enum: AssignmentType, example: AssignmentType.PERMANENT, description: 'Type of assignment' })
  @IsEnum(AssignmentType)
  @IsNotEmpty()
  assignmentType!: AssignmentType;

  @ApiProperty({ example: '2024-06-01', description: 'Assignment date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  assignmentDate!: Date;

  @ApiProperty({ example: '08:00:00', required: false, description: 'Start time (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'startTime must be in format HH:mm:ss' })
  startTime?: string;

  @ApiProperty({ example: '17:00:00', required: false, description: 'End time (HH:mm:ss)' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'endTime must be in format HH:mm:ss' })
  endTime?: string;

  @ApiProperty({ example: 'Khám ngực, phổi', required: false, description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
