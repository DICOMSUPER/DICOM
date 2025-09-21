import { Module } from '@nestjs/common';
import { QueueAssignmentService } from './queue-assignments.service';
import { QueueAssignmentController } from './queue-assignments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueAssignment } from '@backend/shared-domain';

@Module({
  imports: [TypeOrmModule.forFeature([QueueAssignment])],
  controllers: [QueueAssignmentController],
  providers: [QueueAssignmentService],
})
export class QueueAssignmentModule {}
