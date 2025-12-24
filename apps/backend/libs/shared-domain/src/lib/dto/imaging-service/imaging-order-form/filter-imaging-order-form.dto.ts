import { PaginationDto } from '@backend/database';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterImagingOrderFormDto extends PaginationDto {
  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

export class FilterImagingOrderFormServiceDto extends PaginationDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  patientIds?: string[];


}
