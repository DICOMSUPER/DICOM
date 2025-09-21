import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDicomSeryDto {
  @IsString()
  seriesInstanceUid!: string;

  @IsString()
  studyId!: string;

  @IsNumber()
  @IsOptional()
  seriesNumber?: number;

  @IsString()
  @IsOptional()
  seriesDescription?: string;

  //   modality?: string;

  @IsString()
  @IsOptional()
  bodyPartExamined?: string;

  @IsDate()
  @IsOptional()
  seriesDate?: Date;

  @IsString()
  @IsOptional()
  seriesTime?: string;

  @IsString()
  @IsOptional()
  protocolName?: string;

  @IsNumber()
  @IsOptional()
  numberOfInstances?: number;
}
