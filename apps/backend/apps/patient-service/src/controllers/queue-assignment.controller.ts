import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { QueueAssignmentService } from '../services/queue-assignment.service';
import { CreateQueueAssignmentDto, UpdateQueueAssignmentDto } from '../dtos/queue.dto';
import { QueueAssignment } from '../entities/queue-assignment.entity';

@Controller('queue-assignments')
export class QueueAssignmentController {
  constructor(private readonly queueService: QueueAssignmentService) {}

  @Post()
  create(@Body() dto: CreateQueueAssignmentDto): Promise<QueueAssignment> {
    return this.queueService.create(dto);
  }

  @Get()
  findAll(@Query('encounterId') encounterId?: string): Promise<QueueAssignment[]> {
    return this.queueService.findAll(encounterId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<QueueAssignment> {
    return this.queueService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQueueAssignmentDto,
  ): Promise<QueueAssignment> {
    return this.queueService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.queueService.remove(id);
  }
}


