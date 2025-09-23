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
  seriesId!: string;

  @IsString()
  filePath!: string;

  @IsString()
  fileName!: string;

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
