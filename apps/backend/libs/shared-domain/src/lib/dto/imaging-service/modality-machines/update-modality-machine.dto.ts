import { PartialType } from '@nestjs/mapped-types';
import { CreateModalityMachineDto } from './create-modality-machine.dto';

export class UpdateModalityMachineDto extends PartialType(
  CreateModalityMachineDto
) {}
