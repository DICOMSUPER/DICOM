import { IsEnum, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { LogLevel, LogCategory } from '@backend/shared-enums';

export class CreateSystemLogDto {
  @IsEnum(LogLevel)
  @IsNotEmpty()
  logLevel!: LogLevel;

  @IsEnum(LogCategory)
  @IsNotEmpty()
  category!: LogCategory;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsDateString()
  timestamp?: Date;
}