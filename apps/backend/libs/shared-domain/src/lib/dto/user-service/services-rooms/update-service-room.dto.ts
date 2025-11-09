import { IsOptional, IsBoolean, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateServiceRoomDto {
  @ApiPropertyOptional({ description: 'Is this assignment active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Notes about this service-room assignment' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
