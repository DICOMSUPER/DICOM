import { PaginationDto } from '@backend/database';
import { TemplateType } from '@backend/shared-enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FilterReportTemplateDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @ApiPropertyOptional({ description: 'Filter by template type', enum: TemplateType })
  @IsOptional()
  @IsEnum(TemplateType)
  templateType?: TemplateType;

  @ApiPropertyOptional({ description: 'Filter by modality ID' })
  @IsOptional()
  @IsUUID()
  modalityId?: string;

  @ApiPropertyOptional({ description: 'Filter by body part ID' })
  @IsOptional()
  @IsUUID()
  bodyPartId?: string;

  @ApiPropertyOptional({ description: 'Filter by public status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;

}
