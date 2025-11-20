import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MachineStatus } from '@backend/shared-enums';

export class CreateModalityMachineDto {
  @IsString()
  name!: string;

  @IsUUID()
  modalityId!: string;


  @IsOptional()
  manufacturer?: string;


  @IsOptional()
  model?: string;

  @IsOptional()
  serialNumber?: string;


  @IsOptional()
  roomId?: string;

  @IsEnum(MachineStatus)
  @IsOptional()
  status?: MachineStatus;
}
