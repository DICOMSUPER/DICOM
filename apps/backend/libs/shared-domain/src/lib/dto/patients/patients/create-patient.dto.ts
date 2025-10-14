import {
  IsString,
  IsDate,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Gender, BloodType } from '@backend/shared-enums';
import { IsInsuranceNumber } from '@backend/shared-utils';

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  insuranceNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @IsOptional()
  conditions?: any[];
}
