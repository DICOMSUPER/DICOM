import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomScheduleDto } from './create-room-schedule.dto';

export class UpdateRoomScheduleDto extends PartialType(CreateRoomScheduleDto) {}
