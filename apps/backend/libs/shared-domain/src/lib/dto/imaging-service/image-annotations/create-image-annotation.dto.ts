import { AnnotationStatus, AnnotationType } from '@backend/shared-enums';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsJSON,
  IsDecimal,
  IsDate,
} from 'class-validator';
export class CreateImageAnnotationDto {
  @IsString()
  instanceId!: string;

  @IsEnum(AnnotationType)
  annotationType!: AnnotationType;

  @IsJSON()
  annotationData!: object;

  @IsJSON()
  coordinates?: object;

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
  annotationStatus!: AnnotationStatus;

  //   imaging_technician
  @IsString()
  annotatorId!: string;

  @IsString()
  @IsOptional()
  annotationDate: Date = new Date();

  //   //   physician
  //   @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  //   reviewedBy?: string;
  @IsDate()
  @IsOptional()
  reviewDate?: Date;
  @IsString()
  @IsOptional()
  notes?: string;
}
