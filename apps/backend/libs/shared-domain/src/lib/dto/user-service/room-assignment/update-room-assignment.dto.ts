import { PartialType } from '@nestjs/swagger';
import { CreateRoomAssignmentDto } from './create-room-assignment.dto';

export class UpdateRoomAssignmentDto extends PartialType(CreateRoomAssignmentDto) {}
