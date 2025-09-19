import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QueueAssignmentsService } from './queue-assignments.service';
import { CreateQueueAssignmentDto } from './dto/create-queue-assignment.dto';
import { UpdateQueueAssignmentDto } from './dto/update-queue-assignment.dto';

@Controller('queue-assignments')
export class QueueAssignmentsController {
  constructor(private readonly queueAssignmentsService: QueueAssignmentsService) {}

  @Post()
  create(@Body() createQueueAssignmentDto: CreateQueueAssignmentDto) {
    return this.queueAssignmentsService.create(createQueueAssignmentDto);
  }

  @Get()
  findAll() {
    return this.queueAssignmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queueAssignmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueueAssignmentDto: UpdateQueueAssignmentDto) {
    return this.queueAssignmentsService.update(+id, updateQueueAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueAssignmentsService.remove(+id);
  }
}
