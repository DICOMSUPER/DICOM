import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomAssignmentsService } from './room-assignments.service';
import { CreateRoomAssignmentDto } from './dto/create-room-assignment.dto';
import { UpdateRoomAssignmentDto } from './dto/update-room-assignment.dto';

@Controller('room-assignments')
export class RoomAssignmentsController {
  constructor(private readonly roomAssignmentsService: RoomAssignmentsService) {}

  @Post()
  create(@Body() createRoomAssignmentDto: CreateRoomAssignmentDto) {
    return this.roomAssignmentsService.create(createRoomAssignmentDto);
  }

  @Get()
  findAll() {
    return this.roomAssignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomAssignmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomAssignmentDto: UpdateRoomAssignmentDto) {
    return this.roomAssignmentsService.update(+id, updateRoomAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomAssignmentsService.remove(+id);
  }
}
