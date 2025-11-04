import { Module } from '@nestjs/common';
import {
  PatientServiceClientModule,
  UserServiceClientModule,
} from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserModule } from './user/user.module';
import { RoomsModule } from './rooms/rooms.module';
import { DepartmentModule } from './department/department.module';
import { EmployeeSchedulesModule } from './employee-schedules/employee-schedules.module';
import { WeeklySchedulePatternsModule } from './weekly-schedule-patterns/weekly-schedule-patterns.module';
import { ShiftTemplatesModule } from './shift-templates/shift-templates.module';
import { DigitalSignatureModule } from './digital-signature/digital-signature.module';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
    UserModule,
    RoomsModule,
    DepartmentModule,
    EmployeeSchedulesModule,
    WeeklySchedulePatternsModule,
    ShiftTemplatesModule,
    PatientServiceClientModule,
    DigitalSignatureModule,
  ],
  exports: [
    UserServiceClientModule,
    WeeklySchedulePatternsModule,
    UserModule,
    RoomsModule,
    DepartmentModule,
    EmployeeSchedulesModule,
    ShiftTemplatesModule,
    DigitalSignatureModule,
  ],

})
export class UserServiceModule {}