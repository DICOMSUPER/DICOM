import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsOptional()
  imagePosition?: object;

  @IsOptional()
  imageOrientation?: object;

  @IsOptional()
  pixelSpacing?: object;

  @IsNumber()
  @IsOptional()
  sliceThickness?: number;

  @IsNumber()
  @IsOptional()
  windowCenter?: number;

  @IsNumber()
  @IsOptional()
  windowWidth?: number;

  @IsInt()
  @IsOptional()
  rows?: number;

  @IsInt()
  @IsOptional()
  columns?: number;
}
