import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftType } from '@backend/shared-enums';

export class QueryShiftTemplateDto {
  @ApiPropertyOptional({
    description: 'Số trang',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi mỗi trang',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên ca làm việc',
    example: 'Ca sáng',
  })
  @IsOptional()
  @IsString()
  shift_name?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo loại ca làm việc',
    enum: ShiftType,
    example: ShiftType.MORNING,
  })
  @IsOptional()
  @IsEnum(ShiftType)
  shift_type?: ShiftType;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái hoạt động',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo trường',
    example: 'shift_name',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}