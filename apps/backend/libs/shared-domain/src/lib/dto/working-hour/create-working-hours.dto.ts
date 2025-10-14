import { IsEnum, IsNotEmpty, IsString, IsBoolean, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '../../entities/users/working-hours.entity';

export class CreateWorkingHourDto {
  @ApiProperty({ 
    description: 'Thứ trong tuần',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY 
  })
  @IsNotEmpty({ message: 'Thứ không được để trống' })
  @IsEnum(DayOfWeek, { message: 'Thứ không hợp lệ' })
  dayOfWeek!: DayOfWeek;

  @ApiProperty({ 
    description: 'Giờ bắt đầu (HH:MM:SS)', 
    example: '08:00:00' 
  })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @IsString({ message: 'Giờ bắt đầu phải là chuỗi' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Giờ bắt đầu phải có định dạng HH:MM:SS'
  })
  startTime!: string;

  @ApiProperty({ 
    description: 'Giờ kết thúc (HH:MM:SS)', 
    example: '17:00:00' 
  })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @IsString({ message: 'Giờ kết thúc phải là chuỗi' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Giờ kết thúc phải có định dạng HH:MM:SS'
  })
  endTime!: string;

  @ApiPropertyOptional({ 
    description: 'Trạng thái kích hoạt', 
    example: true,
    default: true 
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái kích hoạt phải là boolean' })
  isEnabled?: boolean;

  @ApiPropertyOptional({ 
    description: 'Mô tả', 
    example: 'Ca làm việc hành chính' 
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;
}