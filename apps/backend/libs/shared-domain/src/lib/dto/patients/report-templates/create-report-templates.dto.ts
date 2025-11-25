import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateType } from '@backend/shared-enums';

export class CreateReportTemplateDto {
  @ApiProperty({
    description: 'Name of the report template',
    maxLength: 255,
    example: 'CT Chest Standard Report',
  })
  @IsString()
  @MaxLength(255)
  templateName!: string;

  @ApiProperty({
    description: 'Type of the template',
    enum: TemplateType,
    example: TemplateType.CUSTOM,
  })
  @IsEnum(TemplateType)
  templateType!: TemplateType;

  @ApiProperty({
    description: 'User ID of the template owner',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  ownerUserId?: string;

  @ApiPropertyOptional({
    description: 'Modality ID this template is associated with',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  modalityId?: string;

  @ApiPropertyOptional({
    description: 'Body part ID this template is associated with',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  bodyPartId?: string;

  @ApiPropertyOptional({
    description: 'Whether this template is publicly available',
    default: false,
    example: false,
  })
  @IsOptional()
  isPublic?: boolean = false;

  @ApiPropertyOptional({
    description: 'Template for description section',
    example: 'CT examination of the chest performed with IV contrast...',
  })
  @IsOptional()
  @IsString()
  descriptionTemplate?: string;

  @ApiPropertyOptional({
    description: 'Template for technical section',
    example: 'Technique: Helical CT scan with 5mm slice thickness...',
  })
  @IsOptional()
  @IsString()
  technicalTemplate?: string;

  @ApiPropertyOptional({
    description: 'Template for findings section',
    example: 'Lungs: No focal consolidation, mass, or nodule...',
  })
  @IsOptional()
  @IsString()
  findingsTemplate?: string;

  @ApiPropertyOptional({
    description: 'Template for conclusion section',
    example: 'No acute cardiopulmonary process...',
  })
  @IsOptional()
  @IsString()
  conclusionTemplate?: string;

  @ApiPropertyOptional({
    description: 'Template for recommendation section',
    example: 'Follow-up imaging in 6 months if clinically indicated...',
  })
  @IsOptional()
  @IsString()
  recommendationTemplate?: string;
}
