import { Module } from '@nestjs/common';
import { SharedInterceptorModule } from '@backend/shared-interceptor';
import { UserServiceClientModule } from '@backend/shared-client';
import { ServiceRoomsController } from './service-rooms.controller';

@Module({
  imports: [UserServiceClientModule, SharedInterceptorModule],
  controllers: [ServiceRoomsController],
  exports: [UserServiceClientModule],
})
export class ServiceRoomsModule {}
