import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Length,
  Min,
  IsUUID,
} from 'class-validator';
import { RoomType } from '@backend/shared-enums';
import { RoomStatus } from '../../entities/users/room.entity';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Mã phòng duy nhất (ví dụ: R101)',
    example: 'R101',
    maxLength: 20,
  })
  @IsString()
  @Length(1, 20)
  roomCode!: string;

  @ApiProperty({
    description: 'Loại phòng (ví dụ: SINGLE, DOUBLE, VIP, ICU, ...)',
    enum: RoomType,
    required: false,
  })
  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @ApiProperty({
    description: 'ID của khoa hoặc bộ phận mà phòng thuộc về',
    example: 'b9b05e9d-558a-44b8-92ed-452bff9d72cf',
    required: false,
  })
  @IsUUID()
  department?: string;

  @ApiProperty({
    description: 'Tầng mà phòng nằm ở',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty({
    description: 'Sức chứa (số giường)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiProperty({
    description: 'Giá thuê mỗi ngày (VNĐ)',
    example: 500000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerDay?: number;

  @ApiProperty({
    description: 'Trạng thái phòng',
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
    default: RoomStatus.AVAILABLE,
    required: false,
  })
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @ApiProperty({
    description: 'Mô tả chi tiết về phòng',
    example: 'Phòng VIP hướng biển, có điều hòa và TV.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  // Facilities
  @ApiProperty({ description: 'Có TV hay không', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  hasTV?: boolean;

  @ApiProperty({ description: 'Có điều hòa hay không', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  hasAirConditioning?: boolean;

  @ApiProperty({ description: 'Có WiFi hay không', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  hasWiFi?: boolean;

  @ApiProperty({ description: 'Có điện thoại trong phòng', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  hasTelephone?: boolean;

  @ApiProperty({ description: 'Có phòng tắm riêng', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  hasAttachedBathroom?: boolean;

  @ApiProperty({ description: 'Có thể tiếp cận xe lăn', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isWheelchairAccessible?: boolean;

  @ApiProperty({ description: 'Có cung cấp oxy', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  hasOxygenSupply?: boolean;

  @ApiProperty({ description: 'Có nút gọi y tá', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  hasNurseCallButton?: boolean;

  @ApiProperty({
    description: 'Ghi chú thêm về phòng',
    example: 'Phòng gần khu ICU, phù hợp cho bệnh nhân cần chăm sóc đặc biệt.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của phòng',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
