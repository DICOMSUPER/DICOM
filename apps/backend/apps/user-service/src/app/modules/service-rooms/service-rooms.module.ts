import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room, ServiceRoom, Services } from '@backend/shared-domain';
import { ServiceRoomsController } from './service-rooms.controller';
import { ServiceRoomsService } from './service-rooms.service';
import { PaginationService } from '@backend/database';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRoom,Room,Services])],
  controllers: [ServiceRoomsController],
  providers: [ServiceRoomsService,PaginationService],
  exports: [ServiceRoomsService],
})
export class ServiceRoomsModule {}
