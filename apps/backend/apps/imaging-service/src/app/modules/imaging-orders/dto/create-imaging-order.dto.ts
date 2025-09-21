import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import {
  OrderType,
  OrderPriority,
  OrderStatus,
  Urgency,
} from '@backend/shared-enums';
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

  //   @IsString()
  //   @IsOptional()
  //   procedureCode?: string;

  // @IsString()
  // @IsOptional()
  // procedureDescription?: string;

  @IsEnum(OrderType)
  @IsOptional()
  orderType!: OrderType;

  @IsString()
  @IsOptional()
  urgency!: Urgency;

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
