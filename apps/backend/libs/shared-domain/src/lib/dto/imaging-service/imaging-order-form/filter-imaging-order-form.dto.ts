import { PaginationDto } from '@backend/database';
import { OrderFormStatus } from '@backend/shared-enums';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterImagingOrderFormDto extends PaginationDto {
    @IsOptional()
    @IsString()
    patientName?: string;
    
    @IsEnum(OrderFormStatus)
    @IsOptional()
    status?: OrderFormStatus;

}

export class FilterImagingOrderFormServiceDto extends PaginationDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  patientIds?: string[];

  @IsOptional()
  @IsEnum(OrderFormStatus)
  status?: OrderFormStatus;

}