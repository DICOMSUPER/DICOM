import { Module } from '@nestjs/common';
import { UserServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserModule } from './user/user.module';
import { RoomsModule } from './roooms/rooms.module';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
    UserModule,
    RoomsModule,
    DepartmentModule,

  ],
  exports: [UserServiceClientModule, UserModule,RoomsModule, DepartmentModule],
})
export class UserServiceModule {}