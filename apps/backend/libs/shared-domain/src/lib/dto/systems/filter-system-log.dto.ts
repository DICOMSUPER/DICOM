import { PaginationDto } from '@backend/database';
import { LogLevel, LogCategory } from '@backend/shared-enums';
import { IsEnum, IsOptional } from 'class-validator';

export class FilterSystemLogDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LogLevel, { message: 'logLevel must be INFO, WARN, or ERROR' })
  logLevel?: LogLevel;
  @IsOptional()

  @IsEnum(LogCategory, { message: 'category must be SYSTEM, APPLICATION, or SECURITY' })
  category?: LogCategory;
} 
