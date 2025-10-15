import { PartialType } from '@nestjs/swagger';
import { CreateWorkingHourDto } from './create-working-hours.dto';

export class UpdateWorkingHourDto extends PartialType(CreateWorkingHourDto) {}