import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomScheduleController } from './room-schedule.controller';
import { RoomScheduleService } from './room-schedule.service';
import { RoomScheduleCronService } from './room-schedule.cron';
import { RoomScheduleRepository } from '@backend/shared-domain';
import { RoomSchedule, Room, User, Department, Qualification } from '@backend/shared-domain';
import { WorkingHoursModule } from '../working-hours/working-hours.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomSchedule, Room, User, Department, Qualification]),
    WorkingHoursModule,
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
