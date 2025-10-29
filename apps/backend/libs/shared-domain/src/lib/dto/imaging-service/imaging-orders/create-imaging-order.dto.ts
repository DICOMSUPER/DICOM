import { OrderStatus } from '@backend/shared-enums';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
export class CreateImagingOrderDto {
  @IsString()
  @IsUUID()
  request_procedure_id?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;

  @IsUUID()
  imagingOrderFormId?: string;

  @IsString()
  @IsOptional()
  clinicalIndication?: string;

  @IsBoolean()
  @IsOptional()
  contrastRequired?: boolean = false;

  @IsString()
  specialInstructions?: string;
}
