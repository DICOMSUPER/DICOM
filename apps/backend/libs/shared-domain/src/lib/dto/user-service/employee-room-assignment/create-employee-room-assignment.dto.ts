import { IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeRoomAssignmentDto {
  @ApiProperty({
    description: 'Room schedule ID to assign employee to',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  roomScheduleId!: string;

  @ApiProperty({
    description: 'Employee (User) ID to be assigned',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  employeeId!: string;

  @ApiPropertyOptional({
    description: 'Whether the assignment is active',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}