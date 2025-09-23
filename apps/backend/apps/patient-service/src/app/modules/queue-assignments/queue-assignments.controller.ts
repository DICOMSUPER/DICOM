import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QueueAssignmentService } from './queue-assignments.service';
import { CreateQueueAssignmentDto } from './dto/create-queue-assignment.dto';
import { UpdateQueueAssignmentDto } from './dto/update-queue-assignment.dto';
import type { QueueAssignmentSearchFilters } from '@backend/shared-domain';

@Controller('queue-assignments')
export class QueueAssignmentController {
  constructor(private readonly queueAssignmentService: QueueAssignmentService) {}

  @Post()
  create(@Body() createQueueAssignmentDto: CreateQueueAssignmentDto) {
    return this.queueAssignmentService.create(createQueueAssignmentDto);
  }

  @Get()
  findAll(@Query() filters: QueueAssignmentSearchFilters) {
    return this.queueAssignmentService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.queueAssignmentService.getStats();
  }

  @Get('room/:roomId')
  findByRoom(@Param('roomId') roomId: string) {
    return this.queueAssignmentService.findByRoom(roomId);
  }

  @Get('physician/:physicianId')
  findByPhysician(@Param('physicianId') physicianId: string) {
    return this.queueAssignmentService.findByPhysician(physicianId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queueAssignmentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueueAssignmentDto: UpdateQueueAssignmentDto) {
    return this.queueAssignmentService.update(id, updateQueueAssignmentDto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.queueAssignmentService.complete(id);
  }

  @Patch(':id/expire')
  expire(@Param('id') id: string) {
    return this.queueAssignmentService.expire(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueAssignmentService.remove(id);
  }

  @Post('call-next')
  callNextPatient(@Body() body: { roomId?: string; calledBy?: string }) {
    return this.queueAssignmentService.callNextPatient(body.roomId, body.calledBy);
  }

  @Get('validate/:token')
  validateToken(@Param('token') token: string) {
    return this.queueAssignmentService.validateToken(token);
  }

  @Get(':id/wait-time')
  getEstimatedWaitTime(@Param('id') id: string) {
    return this.queueAssignmentService.getEstimatedWaitTime(id);
  }

  @Post('auto-expire')
  autoExpireAssignments() {
    return this.queueAssignmentService.autoExpireAssignments();
  }
}
