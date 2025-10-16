import { Module } from '@nestjs/common';
import { RoomAssignmentsController } from './room-assignment.controller';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule
  
  ],
  controllers: [RoomAssignmentsController],
})
export class RoomAssignmentsModule {}
