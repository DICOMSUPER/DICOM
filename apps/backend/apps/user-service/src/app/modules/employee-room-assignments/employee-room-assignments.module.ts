import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeRoomAssignment } from '@backend/shared-domain';
import { EmployeeRoomAssignmentsController } from './employee-room-assignments.controller';
import { EmployeeRoomAssignmentsService } from './employee-room-assignments.service';
import { EmployeeRoomAssignmentRepository } from './employee-room-assignments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeRoomAssignment])],
  controllers: [EmployeeRoomAssignmentsController],
  providers: [EmployeeRoomAssignmentsService, EmployeeRoomAssignmentRepository],
  exports: [EmployeeRoomAssignmentsService],
})
export class EmployeeRoomAssignmentsModule {}
