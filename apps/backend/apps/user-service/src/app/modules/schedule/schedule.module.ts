import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeScheduleController } from './employee-schedule.controller';
import { EmployeeScheduleService } from './employee-schedule.service';
import { EmployeeScheduleRepository } from '@backend/shared-domain';
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
    EmployeeScheduleController
  ],
  providers: [
    EmployeeScheduleService,
    EmployeeScheduleRepository
  ],
  exports: [
    EmployeeScheduleService
  ]
})
export class ScheduleModule {}
