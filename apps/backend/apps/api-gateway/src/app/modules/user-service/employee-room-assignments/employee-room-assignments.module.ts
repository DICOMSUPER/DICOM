import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';
import { EmployeeRoomAssignmentsController } from './employee-room-assignments.controller';

@Module({
  imports: [UserServiceClientModule, SharedInterceptorModule],
  controllers: [EmployeeRoomAssignmentsController],
  exports: [UserServiceClientModule],
})
export class EmployeeRoomAssignmentsModule {}
