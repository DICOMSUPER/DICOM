import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(20)
  serviceCode!: string;

  @IsString()
  @MaxLength(100)
  serviceName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}