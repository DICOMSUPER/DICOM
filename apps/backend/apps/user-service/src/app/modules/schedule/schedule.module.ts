import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomScheduleController } from './room-schedule.controller';
import { RoomScheduleService } from './room-schedule.service';
import { RoomScheduleCronService } from './room-schedule.cron';
import { RoomScheduleRepository } from '@backend/shared-domain';
import { RoomSchedule, Room, User, Department } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomSchedule, Room, User, Department]),
  ],
  controllers: [
    RoomScheduleController
  ],
  providers: [
    RoomScheduleService,
    RoomScheduleRepository,
    RoomScheduleCronService
  ],
  exports: [
    RoomScheduleService
  ]
})
export class ScheduleModule {}
