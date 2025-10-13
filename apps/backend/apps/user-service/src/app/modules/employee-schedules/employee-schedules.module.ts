import { Module } from '@nestjs/common';
import { EmployeeSchedulesService } from './employee-schedules.service';
import { EmployeeSchedulesController } from './employee-schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeSchedule } from './entities/employee-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeSchedule])],
  controllers: [EmployeeSchedulesController],
  providers: [EmployeeSchedulesService],
})
export class EmployeeSchedulesModule { }
