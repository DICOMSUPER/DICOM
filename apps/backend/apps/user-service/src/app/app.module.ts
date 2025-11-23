import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentsModule } from './modules/departments/departments.module';
import { UsersModule } from './modules/users/users.module';
import { QualificationsModule } from './modules/qualifications/qualifications.module';
import { DatabaseModule } from '@backend/database';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ShiftTemplatesModule } from './modules/shift-templates/shift-templates.module';
import { WeeklySchedulePatternsModule } from './modules/weekly-schedule-patterns/weekly-schedule-patterns.module';
import { DigitalSignatureModule } from './modules/digital-signature/digital-signature.module';
import { OtpsModule } from './modules/otps/otps.module';
import { SeedingModule } from './modules/seeding/seeding.module';
import { ServiceRoomsModule } from './modules/service-rooms/service-rooms.module';
import { EmployeeRoomAssignmentsModule } from './modules/employee-room-assignments/employee-room-assignments.module';
import { ServicesModule } from './modules/services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    NestScheduleModule.forRoot(),
    DatabaseModule.forService({
      prefix: 'USER',
      defaultDbName: 'dicom_user_service',
    }),
    DepartmentsModule,
    UsersModule,
    QualificationsModule,
    ScheduleModule,
    RoomsModule,
    ShiftTemplatesModule,
    WeeklySchedulePatternsModule,
    OtpsModule,
    SeedingModule,
    DigitalSignatureModule,
    ServiceRoomsModule,
    EmployeeRoomAssignmentsModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
