import { PaginationDto } from '@backend/database';
import { AuditAction } from '@backend/shared-enums';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterAuditLogDto extends PaginationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditAction, { 
    message: `action must be one of: ${Object.values(AuditAction).join(', ')}` 
  })
  action?: AuditAction;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

//   @IsOptional()
//   @IsString()
//   search?: string;
}