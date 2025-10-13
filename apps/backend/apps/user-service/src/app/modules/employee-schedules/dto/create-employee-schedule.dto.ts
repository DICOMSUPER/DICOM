import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsUUID,
  IsMilitaryTime,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ScheduleStatus } from '@backend/shared-enums';

export class CreateEmployeeScheduleDto {
  @ApiProperty({
    description: 'ID nhân viên được phân ca',
    example: '6a91b8f2-2d2c-4e6a-8230-5f35ab8710c4',
  })
  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({
    description: 'ID phòng làm việc',
    example: 'b823a1e4-6c39-48f1-9120-3333aabbccdd',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({
    description: 'ID ca làm việc (shift template)',
    example: 'f2d6a9e1-4b2e-4d91-90f1-6b9c7724cc7a',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  shiftTemplateId?: string;

  @ApiProperty({
    description: 'Ngày làm việc',
    example: '2025-10-12',
  })
  @IsDateString()
  @IsNotEmpty()
  workDate!: Date;

  @ApiProperty({
    description: 'Giờ bắt đầu thực tế (HH:mm)',
    example: '08:30',
    required: false,
  })
  @IsOptional()
  @IsMilitaryTime()
  actualStartTime?: string;

  @ApiProperty({
    description: 'Giờ kết thúc thực tế (HH:mm)',
    example: '17:30',
    required: false,
  })
  @IsOptional()
  @IsMilitaryTime()
  actualEndTime?: string;

  @ApiProperty({
    description: 'Trạng thái lịch làm việc',
    enum: ScheduleStatus,
    example: ScheduleStatus.SCHEDULED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  scheduleStatus?: ScheduleStatus;

  @ApiProperty({
    description: 'Ghi chú thêm',
    example: 'Nhân viên làm thêm ngoài giờ',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;

  @ApiProperty({
    description: 'Số giờ làm thêm (overtime)',
    example: 1.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @ApiProperty({
    description: 'ID người tạo (nếu có)',
    example: '1a77b53b-f9c1-4b61-9929-b83a5cfc1e19',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}

