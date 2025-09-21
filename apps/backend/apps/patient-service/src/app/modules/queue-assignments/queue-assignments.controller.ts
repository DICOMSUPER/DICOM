import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QueueAssignmentService } from './queue-assignments.service';
import { CreateQueueAssignmentDto } from './dto/create-queue-assignment.dto';
import { UpdateQueueAssignmentDto } from './dto/update-queue-assignment.dto';

@Controller('queue-assignments')
export class QueueAssignmentController {
  constructor(private readonly queueAssignmentService: QueueAssignmentService) {}

  @Post()
  create(@Body() createQueueAssignmentDto: CreateQueueAssignmentDto) {
    return this.queueAssignmentService.create(createQueueAssignmentDto);
  }

  @Get()
  findAll() {
    return this.queueAssignmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queueAssignmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQueueAssignmentDto: UpdateQueueAssignmentDto) {
    return this.queueAssignmentService.update(+id, updateQueueAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.queueAssignmentService.remove(+id);
  }
}
