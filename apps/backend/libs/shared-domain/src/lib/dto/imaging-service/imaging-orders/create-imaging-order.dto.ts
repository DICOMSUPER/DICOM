import { OrderStatus, Urgency } from '@backend/shared-enums';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
export class CreateImagingOrderDto {
  @IsString()
  orderNumber!: string;

  @IsString()
  patientId!: string;

  //   @IsString()
  //   visitId!: string;

  @IsString()
  orderingPhysicianId!: string;

  @IsString()
  modalityId!: string;

  @IsString()
  bodyPart!: string;

  @IsString()
  @IsUUID()
  request_procedure_id?: string;

  @IsString()
  @IsOptional()
  urgency?: Urgency;

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
