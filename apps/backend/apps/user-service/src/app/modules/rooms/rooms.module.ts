import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from '@backend/shared-domain';
import {  User, Department } from '@backend/shared-domain';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackendRedisModule } from '@backend/redis';
import { ImagingServiceClientModule } from '@backend/shared-client';

@Module({
   imports: [
      TypeOrmModule.forFeature([
        Room,
        User,
        Department,
      
      ]),
      BackendRedisModule,
      ImagingServiceClientModule
      
    ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
