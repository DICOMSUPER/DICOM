import { AnnotationStatus, AnnotationType } from '@backend/shared-enums';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsJSON,
  IsDecimal,
  IsDate,
  IsIn,
} from 'class-validator';
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

  @IsDecimal()
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
  @IsIn([AnnotationStatus.DRAFT, AnnotationStatus.FINAL])
  annotationStatus!: AnnotationStatus;

  //   imaging_technician
  @IsString()
  annotatorId!: string;

  @IsString()
  @IsOptional()
  annotationDate: Date = new Date();

  @IsDate()
  @IsOptional()
  reviewDate?: Date;
  @IsString()
  @IsOptional()
  notes?: string;
}
