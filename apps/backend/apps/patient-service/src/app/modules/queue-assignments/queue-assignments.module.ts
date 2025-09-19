import { Module } from '@nestjs/common';
import { QueueAssignmentsService } from './queue-assignments.service';
import { QueueAssignmentsController } from './queue-assignments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueAssignment } from '@backend/shared-domain';

@Module({
  imports: [TypeOrmModule.forFeature([QueueAssignment])],
  controllers: [QueueAssignmentsController],
  providers: [QueueAssignmentsService],
})
export class QueueAssignmentsModule {}
