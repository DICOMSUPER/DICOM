import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-services.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
