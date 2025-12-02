import { PaginationDto } from '@backend/database';
import { DicomStudyStatus } from '@backend/shared-enums';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterDicomStudyFormDto extends PaginationDto {
  @IsOptional()
  @IsString()
  patientName?: string;

  @IsEnum(DicomStudyStatus)
  @IsOptional()
  status?: DicomStudyStatus;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  modalityMachineId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

export class FilterDicomStudyServiceDto extends PaginationDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  patientIds?: string[];

  @IsOptional()
  @IsEnum(DicomStudyStatus)
  status?: DicomStudyStatus;
}
