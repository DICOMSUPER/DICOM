import { PaginationDto } from '@backend/database';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class FilterServiceDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by service code (partial match)',
    example: 'XRAY_STD',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  serviceCode?: string;

  @ApiPropertyOptional({
    description: 'Filter by service name (partial match)',
    example: 'X-Ray Chest',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serviceName?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;


}