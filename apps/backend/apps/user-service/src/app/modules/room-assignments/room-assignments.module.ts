import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomAssignmentsService } from './room-assignments.service';
import { RoomAssignmentsController } from './room-assignments.controller';

import { User, Department, Qualification, RoomAssignment, Room } from '@backend/shared-domain';


@Module({
   imports: [
      TypeOrmModule.forFeature([
        RoomAssignment,
        User,
        Department,
        Qualification,
        Room
      ]),
    ],
  controllers: [RoomAssignmentsController],
  providers: [RoomAssignmentsService],
  exports: [RoomAssignmentsService],
})
export class RoomAssignmentsModule {}
