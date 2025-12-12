import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SegmentationStatus } from '@backend/shared-enums';

export class CreateImageSegmentationLayerDto {
  @IsString()
  @IsOptional()
  layerName!: string;

  @IsUUID()
  instanceId!: string;

  @IsUUID()
  @IsOptional() //can get from token
  segmentatorId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsNumber()
  frame?: number | null;

  @IsOptional()
  @IsString()
  colorCode?: string;

  @IsOptional()
  @IsEnum(SegmentationStatus)
  segmentationStatus?: SegmentationStatus;

  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  reviewDate?: string;

  @IsOptional()
  @IsString()
  segmentationDate?: string;

  @IsArray()
  snapshots!: object[];
}
