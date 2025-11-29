import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
  frame?: number = 1;

  @IsArray()
  snapshots!: object[];
}
