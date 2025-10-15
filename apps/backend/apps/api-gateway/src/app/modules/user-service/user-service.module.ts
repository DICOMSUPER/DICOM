import { Module } from '@nestjs/common';
import { UserServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserModule } from './user/user.module';
import { RoomsModule } from './rooms/rooms.module';
import { DepartmentModule } from './department/department.module';
import { EmployeeSchedulesModule } from './employee-schedules/employee-schedules.module';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
    UserModule,
    RoomsModule,
    DepartmentModule,
    EmployeeSchedulesModule,
  ],
  exports: [UserServiceClientModule, UserModule, RoomsModule, DepartmentModule, EmployeeSchedulesModule],
})
export class UserServiceModule {}