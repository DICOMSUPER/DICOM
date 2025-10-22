import {
  IsDecimal,
  IsInt,
  IsJSON,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDicomInstanceDto {
  @IsString()
  sopInstanceUid!: string;

  @IsString()
  sopClassUID!: string;

  @IsString()
  seriesId!: string;

  @IsInt()
  instanceNumber!: number;

  @IsString()
  filePath!: string;

  @IsString()
  fileName!: string;

  @IsInt()
  numberOfFrame!: number;

  @IsJSON()
  @IsOptional()
  imagePosition?: object;

  @IsJSON()
  @IsOptional()
  imageOrientation?: object;

  @IsJSON()
  @IsOptional()
  pixelSpacing?: object;

  @IsDecimal()
  @IsOptional()
  sliceThickness?: number;

  @IsDecimal()
  @IsOptional()
  windowCenter?: number;

  @IsDecimal()
  @IsOptional()
  windowWidth?: number;

  @IsInt()
  @IsOptional()
  rows?: number;

  @IsInt()
  @IsOptional()
  columns?: number;
}
