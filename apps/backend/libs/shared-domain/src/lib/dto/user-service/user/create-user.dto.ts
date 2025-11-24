import { IsEmail, IsNotEmpty, IsString, Length, IsOptional, IsEnum, IsBoolean, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles } from '@backend/shared-enums';

export class CreateUserDto {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'john_doe' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @Length(3, 50, { message: 'Tên đăng nhập phải từ 3 đến 50 ký tự' })
  username!: string;

  @ApiProperty({ description: 'Email đăng nhập', example: 'john.doe@company.com' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Length(1, 100, { message: 'Email không được vượt quá 100 ký tự' })
  email!: string;

  @ApiProperty({ description: 'Mật khẩu đăng nhập', example: 'Password123!' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @Length(8, 30, { message: 'Mật khẩu phải từ 8 đến 30 ký tự' })
  password!: string;

  @ApiProperty({ description: 'Tên', example: 'John' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Tên phải là chuỗi' })
  @Length(1, 50, { message: 'Tên không được vượt quá 50 ký tự' })
  firstName!: string;

  @ApiProperty({ description: 'Họ', example: 'Doe' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  @IsString({ message: 'Họ phải là chuỗi' })
  @Length(1, 50, { message: 'Họ không được vượt quá 50 ký tự' })
  lastName!: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0123456789' })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @Length(10, 20, { message: 'Số điện thoại phải từ 10 đến 20 ký tự' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Mã nhân viên', example: 'EMP001' })
  @IsOptional()
  @IsString({ message: 'Mã nhân viên phải là chuỗi' })
  @Length(1, 20, { message: 'Mã nhân viên không được vượt quá 20 ký tự' })
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Trạng thái xác thực', example: false })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xác thực phải là boolean' })
  isVerified?: boolean;

  @ApiPropertyOptional({ 
    description: 'Vai trò người dùng', 
    enum: Roles,
    example: Roles.RECEPTION_STAFF 
  })
  @IsOptional()
  @IsEnum(Roles, { message: 'Vai trò không hợp lệ' })
  role?: Roles;

  @ApiPropertyOptional({ description: 'ID phòng ban', example: 'uuid-string', nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.departmentId !== null && o.departmentId !== undefined)
  @IsUUID(4, { message: 'ID phòng ban phải là UUID hợp lệ' })
  departmentId?: string | null;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', example: true })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'ID người tạo', example: 'uuid-string' })
  @IsOptional()
  @IsUUID(4, { message: 'ID người tạo phải là UUID hợp lệ' })
  createdBy?: string;
}