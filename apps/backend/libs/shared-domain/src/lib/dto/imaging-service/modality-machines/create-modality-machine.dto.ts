import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MachineStatus } from '@backend/shared-enums';

export class CreateModalityMachineDto {
  @IsString()
  name!: string;

  @IsUUID()
  modalityId!: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsUUID()
  @IsOptional()
  roomId?: string;

  @IsEnum(MachineStatus)
  @IsOptional()
  status?: MachineStatus;
}
