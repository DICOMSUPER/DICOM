import { PaginationDto } from '@backend/database';
import { OrderFormStatus } from '@backend/shared-enums';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterImagingOrderFormDto extends PaginationDto {
    @IsOptional()
    @IsString()
    name?: string;
    
    @IsOptional()
    @IsUUID()
    patientId?: string;

    @IsEnum(OrderFormStatus)
    @IsOptional()
    status?: OrderFormStatus;

}