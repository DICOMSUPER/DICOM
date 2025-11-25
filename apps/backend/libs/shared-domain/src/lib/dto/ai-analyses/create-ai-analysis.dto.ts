import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AnalysisStatus } from '@backend/shared-enums';

export class CreateAiAnalysisDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  studyId!: string;

  // @IsString()
  // @IsNotEmpty()
  // seriesId!: string;

//   @IsString()
//   @IsNotEmpty()
//   modelName!: string;

//   @IsString()
//   @IsNotEmpty()
//   modelVersion!: string;


  @IsEnum(AnalysisStatus)
  @IsNotEmpty()
  status!: AnalysisStatus;

  @IsOptional()
  analysisResults?: any;

  @IsOptional()
  @IsString()
  findings?: string;

//   @IsOptional()
//   @IsString()
//   processingTime?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

}