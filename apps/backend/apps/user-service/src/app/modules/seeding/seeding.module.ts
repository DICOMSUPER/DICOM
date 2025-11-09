import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedingService } from './seeding.service';
import { SeedingController } from './seeding.controller';
import {
  ShiftTemplate,
  Department,
  Room,
  User,
  RoomSchedule,
  EmployeeRoomAssignment,
} from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShiftTemplate,
      Department,
      Room,
      User,
      RoomSchedule,
      EmployeeRoomAssignment,
    ]),
  ],
  controllers: [SeedingController],
  providers: [SeedingService],
  exports: [SeedingService],
})
export class SeedingModule {}
