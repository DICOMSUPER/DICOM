import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { AuditAction } from '@backend/shared-enums';

export class CreateAuditLogDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(AuditAction)
  @IsNotEmpty()
  action!: AuditAction;

  @IsString()
  @IsNotEmpty()
  resource!: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: Date;
}