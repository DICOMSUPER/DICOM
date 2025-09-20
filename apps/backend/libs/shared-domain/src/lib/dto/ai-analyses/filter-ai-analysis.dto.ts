import { PaginationDto } from '@backend/database';
import { AnalysisStatus } from '@backend/shared-enums';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterAiAnalysisDto extends PaginationDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  studyId?: string;

  @IsOptional()
  @IsString()
  seriesId?: string;

//   @IsOptional()
//   @IsString()
//   modelName?: string;

  @IsOptional()
  @IsEnum(AnalysisStatus, { 
    message: `status must be one of: ${Object.values(AnalysisStatus).join(', ')}` 
  })
  status?: AnalysisStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

//   @IsOptional()
//   @IsString()
//   search?: string;
}