import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomAssignmentsService } from './room-assignments.service';
import { CreateRoomAssignmentDto, QueryRoomAssignmentDto, UpdateRoomAssignmentDto, } from '@backend/shared-domain';

@Controller()
export class RoomAssignmentsController {
  constructor(private readonly roomAssignmentsService: RoomAssignmentsService) {}


  @MessagePattern('room_assignment.create')
  async create(@Payload() createRoomAssignmentDto: CreateRoomAssignmentDto) {
    return this.roomAssignmentsService.create(createRoomAssignmentDto);
  }

  @MessagePattern('room_assignment.findByUserId')
  async findByUserId(@Payload() data: { userId: string }) {
    return await this.roomAssignmentsService.findByUserId(data.userId);
  }



  // Get all room assignments
  @MessagePattern('room_assignment.findAll')
  async findAll(@Payload() queryDto: QueryRoomAssignmentDto) {
    return this.roomAssignmentsService.findAll(queryDto);
  }


  @MessagePattern('room_assignment.findOne')
  async findOne(@Payload() id: string) {
    return this.roomAssignmentsService.findOne(id);
  }

  @MessagePattern('room_assignment.update')
  async update(@Payload() data: { id: string; dto: UpdateRoomAssignmentDto }) {
    const { id, dto } = data;
    return this.roomAssignmentsService.update(id, dto);
  }

  @MessagePattern('room_assignment.remove')
  async remove(@Payload() id: string) {
    await this.roomAssignmentsService.remove(id);
    return { message: 'Room assignment soft deleted successfully' };
  }


  @MessagePattern('room_assignment.hardRemove')
  async hardRemove(@Payload() id: string) {
    await this.roomAssignmentsService.hardRemove(id);
    return { message: 'Room assignment permanently deleted successfully' };
  }
}
