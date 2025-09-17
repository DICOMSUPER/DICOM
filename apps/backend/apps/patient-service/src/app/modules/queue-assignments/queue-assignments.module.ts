import { Module } from '@nestjs/common';
import { QueueAssignmentsService } from './queue-assignments.service';
import { QueueAssignmentsController } from './queue-assignments.controller';

@Module({
  controllers: [QueueAssignmentsController],
  providers: [QueueAssignmentsService],
})
export class QueueAssignmentsModule {}
