import { Module } from '@nestjs/common';
import { QueueAssignmentService } from './queue-assignments.service';
import { QueueAssignmentController } from './queue-assignments.controller';
// import { QueueCronService } from './queue-cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueAssignment, QueueAssignmentRepository } from '@backend/shared-domain';
// import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueAssignment]),
    // ScheduleModule.forRoot() // Commented out until database is set up
  ],
  controllers: [QueueAssignmentController],
  providers: [QueueAssignmentService, QueueAssignmentRepository], // Removed QueueCronService
  exports: [QueueAssignmentService],
})
export class QueueAssignmentModule {}
