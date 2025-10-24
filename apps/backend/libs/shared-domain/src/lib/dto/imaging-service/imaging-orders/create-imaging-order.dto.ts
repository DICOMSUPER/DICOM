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
  patientId!: string;

  @IsString()
  @IsUUID()
  orderingPhysicianId!: string;

  @IsString()
  @IsUUID()
  modalityId?: string;

  @IsString()
  bodyPart!: string;

  @IsString()
  @IsUUID()
  request_procedure_id?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus!: OrderStatus;

  @IsString()
  @IsOptional()
  clinicalIndication?: string;

  @IsBoolean()
  @IsOptional()
  contrastRequired?: boolean = false;

  @IsString()
  specialInstructions?: string;

  @IsString()
  roomId!: string;

  @IsString()
  notes?: string;
}
