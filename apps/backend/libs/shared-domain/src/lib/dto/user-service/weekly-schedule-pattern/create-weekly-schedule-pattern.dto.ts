import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { DayOfWeek } from '@backend/shared-enums';
import { Type } from 'class-transformer';

export class CreateWeeklySchedulePatternDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: 'b9b05e9d-558a-44b8-92ed-452bff9d72cf',
  })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    description: 'Ngày trong tuần (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  
  @IsEnum(DayOfWeek)
  @Type(() => Number)
  dayOfWeek!: DayOfWeek;

  @ApiProperty({
    description: 'ID của mẫu ca làm việc',
    example: 'c7b05e9d-558a-44b8-92ed-452bff9d72cf',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  shiftTemplateId?: string;

  @ApiProperty({
    description: 'Giờ bắt đầu tùy chỉnh (định dạng HH:MM:SS)',
    example: '08:00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  customStartTime?: string;

  @ApiProperty({
    description: 'Giờ kết thúc tùy chỉnh (định dạng HH:MM:SS)',
    example: '17:00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  customEndTime?: string;

  @ApiProperty({
    description: 'Có phải ngày làm việc hay không',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isWorkingDay?: boolean;

  @ApiProperty({
    description: 'Ngày bắt đầu có hiệu lực',
    example: '2025-01-01',
  })
  @IsDateString()
  effectiveFrom!: string;

  @ApiProperty({
    description: 'Ngày kết thúc có hiệu lực',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Lịch làm việc mùa hè',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}