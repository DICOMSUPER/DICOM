import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeScheduleController } from './employee-schedule.controller';
import { RoomController } from './room.controller';
import { EmployeeScheduleService } from './employee-schedule.service';
import { RoomService } from './room.service';
import { EmployeeScheduleRepository } from '@backend/shared-domain';
import { RoomRepository } from '@backend/shared-domain';
import { EmployeeSchedule, Room } from '@backend/shared-domain';
import { WorkingHoursModule } from '../working-hours/working-hours.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeSchedule,
      Room
    ]),
    WorkingHoursModule
  ],
  controllers: [
    EmployeeScheduleController,
    RoomController
  ],
  providers: [
    EmployeeScheduleService,
    RoomService,
    EmployeeScheduleRepository,
    RoomRepository
  ],
  exports: [
    EmployeeScheduleService,
    RoomService
  ]
})
export class ScheduleModule {}
