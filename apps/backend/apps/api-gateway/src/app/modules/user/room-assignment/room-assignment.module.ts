import { Module } from '@nestjs/common';
import { RoomAssignmentsController } from './room-assignment.controller';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { getClient } from '@backend/shared-utils';


@Module({
  imports: [ ClientsModule.register([
        getClient(
          process.env.USER_SERVICE_NAME || 'UserService',
          Number(process.env.USER_SERVICE_TRANSPORT || Transport.TCP),
          process.env.USER_SERVICE_HOST || 'localhost',
          Number(process.env.USER_SERVICE_PORT || 5002)
        ),
      ]),],
  controllers: [RoomAssignmentsController],
})    
export class RoomAssignmentsModule {}
