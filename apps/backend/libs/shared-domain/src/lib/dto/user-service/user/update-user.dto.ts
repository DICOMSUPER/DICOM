import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'ID phòng ban mà người dùng sẽ là trưởng phòng', example: 'uuid-string', nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.targetDepartmentId !== null && o.targetDepartmentId !== undefined)
  @IsUUID(4, { message: 'ID phòng ban phải là UUID hợp lệ' })
  targetDepartmentId?: string | null;
}
