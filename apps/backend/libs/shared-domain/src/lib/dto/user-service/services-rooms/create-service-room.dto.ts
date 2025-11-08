import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateServiceRoomDto {
  @ApiProperty({ description: 'Service ID' })
  @IsString()
  serviceId!: string;

  @ApiProperty({ description: 'Room ID' })
  @IsString()
  roomId!: string;

  @ApiPropertyOptional({ description: 'Indicates if the service-room assignment is active', default: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Notes about this service-room assignment' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
