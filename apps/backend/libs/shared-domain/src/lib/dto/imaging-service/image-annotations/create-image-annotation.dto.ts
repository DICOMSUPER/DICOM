import {
  IsString,
  IsEnum,
  IsOptional,
  IsJSON,
  IsNumber,
  IsUUID,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AnnotationStatus, AnnotationType } from '@backend/shared-enums';

export class CreateImageAnnotationDto {
  @IsString()
  instanceId!: string;

  @IsEnum(AnnotationType)
  annotationType!: AnnotationType;

  @IsJSON()
  annotationData!: Record<string, any>;

  @IsJSON()
  @IsOptional()
  coordinates?: Record<string, any>;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  measurementValue?: number;

  @IsString()
  @IsOptional()
  measurementUnit?: string;

  @IsString()
  @IsOptional()
  textContent?: string;

  @IsString()
  @IsOptional()
  colorCode?: string;

  @IsEnum(AnnotationStatus)
  annotationStatus!: AnnotationStatus;

  @IsUUID()
  @IsOptional()
  annotatorId?: string;

  @IsISO8601()
  @IsOptional()
  annotationDate?: string;

  @IsISO8601()
  @IsOptional()
  reviewDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  reviewerId?: string;
}
