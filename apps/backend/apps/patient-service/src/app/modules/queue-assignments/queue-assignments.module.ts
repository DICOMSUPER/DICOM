import { Module } from '@nestjs/common';
import { QueueAssignmentService } from './queue-assignments.service';
import { QueueAssignmentController } from './queue-assignments.controller';
// import { QueueCronService } from './queue-cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  PatientEncounterRepository,
  QueueAssignment,
  QueueAssignmentRepository,
} from '@backend/shared-domain';
import { PaginationService } from '@backend/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';
// import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueAssignment]),
    ClientsModule.register([
      getClient(
        process.env.USER_SERVICE_NAME || 'UserService',
        Number(process.env.USER_SERVICE_TRANSPORT || Transport.TCP),
        process.env.USER_SERVICE_HOST || 'localhost',
        Number(process.env.USER_SERVICE_PORT || 5002)
      ),
    ]),
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
    PaginationService,
    PatientEncounterRepository,
  ],
  exports: [QueueAssignmentService, QueueAssignmentRepository],
})
export class QueueAssignmentModule {}
