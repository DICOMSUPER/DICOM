import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomAssignmentDto } from './create-room-assignment.dto';

export class UpdateRoomAssignmentDto extends PartialType(CreateRoomAssignmentDto) {}
