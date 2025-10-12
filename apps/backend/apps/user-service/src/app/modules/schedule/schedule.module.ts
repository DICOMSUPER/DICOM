import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeScheduleController } from './employee-schedule.controller';
import { ShiftTemplateController } from './shift-template.controller';
import { RoomController } from './room.controller';
import { EmployeeScheduleService } from './employee-schedule.service';
import { ShiftTemplateService } from './shift-template.service';
import { RoomService } from './room.service';
import { EmployeeScheduleRepository } from '@backend/shared-domain';
import { ShiftTemplateRepository } from '@backend/shared-domain';
import { RoomRepository } from '@backend/shared-domain';
import { EmployeeSchedule } from '@backend/shared-domain';
import { ShiftTemplate } from '@backend/shared-domain';
import { Room } from '@backend/shared-domain';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeSchedule,
      ShiftTemplate,
      Room
    ])
  ],
  controllers: [
    EmployeeScheduleController,
    ShiftTemplateController,
    RoomController
  ],
  providers: [
    EmployeeScheduleService,
    ShiftTemplateService,
    RoomService,
    EmployeeScheduleRepository,
    ShiftTemplateRepository,
    RoomRepository
  ],
  exports: [
    EmployeeScheduleService,
    ShiftTemplateService,
    RoomService
  ]
})
export class ScheduleModule {}
