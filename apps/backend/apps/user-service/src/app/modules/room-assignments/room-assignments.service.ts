import { Injectable } from '@nestjs/common';
import { CreateRoomAssignmentDto } from './dto/create-room-assignment.dto';
import { UpdateRoomAssignmentDto } from './dto/update-room-assignment.dto';

@Injectable()
export class RoomAssignmentsService {
  create(createRoomAssignmentDto: CreateRoomAssignmentDto) {
    return 'This action adds a new roomAssignment';
  }

  findAll() {
    return `This action returns all roomAssignments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roomAssignment`;
  }

  update(id: number, updateRoomAssignmentDto: UpdateRoomAssignmentDto) {
    return `This action updates a #${id} roomAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} roomAssignment`;
  }
}
