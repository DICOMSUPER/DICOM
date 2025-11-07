import { Module } from '@nestjs/common';
import { RoomSchedulesController } from './room-schedules.controller';
import { UserServiceClientModule } from '@backend/shared-client';
import { SharedInterceptorModule } from '@backend/shared-interceptor';

@Module({
  imports: [
    UserServiceClientModule,
    SharedInterceptorModule,
  ],
  controllers: [RoomSchedulesController],
  exports: [UserServiceClientModule],
})
export class RoomSchedulesModule {}
