import { Module } from '@nestjs/common';
import { QueueAssignmentService } from './queue-assignments.service';
import { QueueAssignmentController } from './queue-assignments.controller';
// import { QueueCronService } from './queue-cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { QueueAssignment, QueueAssignmentRepository } from '@backend/shared-domain';
// import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueAssignment]),
    // ScheduleModule.forRoot() // Commented out until database is set up
  ],
  controllers: [QueueAssignmentController],
  providers: [
    QueueAssignmentService,
    {
      provide: QueueAssignmentRepository,
      useFactory: (entityManager: EntityManager) => 
        new QueueAssignmentRepository(entityManager),
      inject: [EntityManager],
    },
  ],
  exports: [QueueAssignmentService, QueueAssignmentRepository],
})
export class QueueAssignmentModule {}
