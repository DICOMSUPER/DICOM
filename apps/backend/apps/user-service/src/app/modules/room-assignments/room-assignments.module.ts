import { Module } from '@nestjs/common';
import { RoomAssignmentsService } from './room-assignments.service';
import { RoomAssignmentsController } from './room-assignments.controller';
import { RoomAssignment } from './entities/room-assignment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports: [
      TypeOrmModule.forFeature([
        RoomAssignment,
      ]),
    ],
  controllers: [RoomAssignmentsController],
  providers: [RoomAssignmentsService],
})
export class RoomAssignmentsModule {}
