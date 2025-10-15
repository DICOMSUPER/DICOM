import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';
import { RoomAssignmentsModule } from '../../user/room-assignment/room-assignment.module';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
    RoomAssignmentsModule
  ],
  controllers: [UserController],
  exports: [UserServiceClientModule],
})
export class UserModule {}
