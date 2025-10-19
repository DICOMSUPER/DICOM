import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ShiftType } from '@backend/shared-enums';

export class CreateShiftTemplateDto {
  @ApiProperty({
    description: 'Tên ca làm việc',
    example: 'Ca sáng',
    maxLength: 50,
    minLength: 1,
  })
  @IsString()
  @MinLength(1, { message: 'Tên ca làm việc không được để trống' })
  @MaxLength(50, { message: 'Tên ca làm việc không được vượt quá 50 ký tự' })
  shift_name!: string;

  @ApiProperty({
    description: 'Loại ca làm việc',
    enum: ShiftType,
    example: ShiftType.MORNING,
  })
  @IsEnum(ShiftType, { message: 'Loại ca làm việc không hợp lệ' })
  shift_type!: ShiftType;

  @ApiProperty({
    description: 'Giờ bắt đầu (định dạng HH:MM:SS)',
    example: '08:00:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Giờ bắt đầu phải có định dạng HH:MM:SS',
  })
  start_time!: string;

  @ApiProperty({
    description: 'Giờ kết thúc (định dạng HH:MM:SS)',
    example: '17:00:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Giờ kết thúc phải có định dạng HH:MM:SS',
  })
  end_time!: string;

  @ApiProperty({
    description: 'Giờ bắt đầu nghỉ giải lao (định dạng HH:MM:SS)',
    example: '12:00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Giờ bắt đầu nghỉ giải lao phải có định dạng HH:MM:SS',
  })
  break_start_time?: string;

  @ApiProperty({
    description: 'Giờ kết thúc nghỉ giải lao (định dạng HH:MM:SS)',
    example: '13:00:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Giờ kết thúc nghỉ giải lao phải có định dạng HH:MM:SS',
  })
  break_end_time?: string;

  @ApiProperty({
    description: 'Mô tả về ca làm việc',
    example: 'Ca làm việc buổi sáng từ 8h đến 17h',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}