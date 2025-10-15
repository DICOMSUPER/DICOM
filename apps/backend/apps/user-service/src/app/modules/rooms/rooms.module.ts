import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from '@backend/shared-domain';
import { RoomAssignment, User, Department, Qualification } from '@backend/shared-domain';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports: [
      TypeOrmModule.forFeature([
        Room,
        RoomAssignment,
        User,
        Department,
        Qualification,
      ]),
    ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
