import { IsString, IsNotEmpty, IsOptional, MaxLength, IsBoolean, IsUUID } from 'class-validator';
import { PaginationDto } from '@backend/database';

export class CreateDepartmentDto extends PaginationDto{
  @IsUUID()
  @IsOptional()
  headDepartmentId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  departmentName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  departmentCode!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}