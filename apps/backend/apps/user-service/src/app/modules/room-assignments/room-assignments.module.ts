import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomAssignmentsService } from './room-assignments.service';
import { RoomAssignmentsController } from './room-assignments.controller';
import { RoomAssignment } from './entities/room-assignment.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomAssignment,
      User,
      Room,
    ]),
  ],
  controllers: [RoomAssignmentsController],
  providers: [RoomAssignmentsService],
  exports: [RoomAssignmentsService],
})
export class RoomAssignmentsModule {}
