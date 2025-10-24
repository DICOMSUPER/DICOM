import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRequestProcedureDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsUUID()
  modalityId!: string;

  @IsNotEmpty()
  @IsUUID()
  bodyPartId!: string;

  @IsString()
  @IsOptional()
  description?: string;

  // @IsOptional()
  // @IsBoolean()
  // isActive?: boolean;
}
