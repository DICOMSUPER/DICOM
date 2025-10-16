import { Module } from '@nestjs/common';
import { UserServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserModule } from './user/user.module';
import { RoomsModule } from './roooms/rooms.module';
import { DepartmentModule } from './department/department.module';
import { RoomAssignmentsModule } from './room-assignment/room-assignment.module';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
    UserModule,
    RoomsModule,
    DepartmentModule,
    RoomAssignmentsModule

  ],
  exports: [UserServiceClientModule, UserModule,RoomsModule, DepartmentModule],
})
export class UserServiceModule {}