import { Module } from '@nestjs/common';
import { RoomAssignmentsService } from './room-assignments.service';
import { RoomAssignmentsController } from './room-assignments.controller';

@Module({
  controllers: [RoomAssignmentsController],
  providers: [RoomAssignmentsService],
})
export class RoomAssignmentsModule {}
