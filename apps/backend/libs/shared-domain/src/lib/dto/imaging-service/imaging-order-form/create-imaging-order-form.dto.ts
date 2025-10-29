import { OrderFormStatus } from '@backend/shared-enums';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateImagingOrderDto } from '../..';

export class CreateImagingOrderFormDto {
  @IsUUID()
  patientId!: string;

  @IsUUID()
  encounterId!: string;

  @IsEnum(OrderFormStatus)
  @IsOptional()
  orderFormStatus?: OrderFormStatus;

  @IsUUID()
  roomId!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImagingOrderDto)
  imagingOrders!: CreateImagingOrderDto[];

}
