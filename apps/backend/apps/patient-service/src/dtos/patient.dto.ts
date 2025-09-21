import { IsString, IsEnum, IsDate, IsOptional, IsBoolean } from 'class-validator';
import { Gender, BloodType } from '../entities/patient.entity';

export class CreatePatientDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsDate()
  dateOfBirth!: Date;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(BloodType)
  @IsOptional()
  bloodType?: BloodType;

  @IsString()
  @IsOptional()
  insuranceNumber?: string;
}

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDate()
  @IsOptional()
  dateOfBirth?: Date;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(BloodType)
  @IsOptional()
  bloodType?: BloodType;

  @IsString()
  @IsOptional()
  insuranceNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}