import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentsModule } from './modules/departments/departments.module';
import { UsersModule } from './modules/users/users.module';
import { QualificationsModule } from './modules/qualifications/qualifications.module';
import { DatabaseModule } from '@backend/database';
import { ConfigModule } from '@nestjs/config';
import { EmployeeSchedulesModule } from './modules/employee-schedules/employee-schedules.module';
import { LeaveRequestsModule } from './modules/leave-requests/leave-requests.module';
import { RoomAssignmentsModule } from './modules/room-assignments/room-assignments.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ShiftTemplatesModule } from './modules/shift-templates/shift-templates.module';
import { WeeklySchedulePatternsModule } from './modules/weekly-schedule-patterns/weekly-schedule-patterns.module';
import { ScheduleReplacementsModule } from './modules/schedule-replacements/schedule-replacements.module';
import { OtpsModule } from './modules/otps/otps.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule.forService({
      prefix: 'USER',
      defaultDbName: 'dicom_user_service',
    }),
    DepartmentsModule,
    UsersModule,
    QualificationsModule,
    EmployeeSchedulesModule,
    LeaveRequestsModule,
    RoomAssignmentsModule,
    RoomsModule,
    ShiftTemplatesModule,
    WeeklySchedulePatternsModule,
    ScheduleReplacementsModule,
    OtpsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
