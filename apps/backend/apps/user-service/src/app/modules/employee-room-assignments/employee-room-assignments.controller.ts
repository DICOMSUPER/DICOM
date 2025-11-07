import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeRoomAssignmentsService } from './employee-room-assignments.service';
import { CreateEmployeeRoomAssignmentDto } from '@backend/shared-domain';


@Controller()
export class EmployeeRoomAssignmentsController {
  constructor(
    private readonly employeeRoomAssignmentsService: EmployeeRoomAssignmentsService
  ) {}

  @MessagePattern('UserService.EmployeeRoomAssignments.Create')
  async create(
    @Payload()
    data: CreateEmployeeRoomAssignmentDto
  ) {
    return await this.employeeRoomAssignmentsService.create(data);
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.FindAll')
  async findAll(
    @Payload()
    filter?: {
      employeeId?: string;
      roomId?: string;
      serviceId?: string;
      isActive?: boolean;
    }
  ) {
    return await this.employeeRoomAssignmentsService.findAll(filter);
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.FindOne')
  async findOne(@Payload() id: string) {
    return await this.employeeRoomAssignmentsService.findOne(id);
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.FindByEmployee')
  async findByEmployee(@Payload() employeeId: string) {
    return await this.employeeRoomAssignmentsService.findByEmployee(employeeId);
  }



  @MessagePattern('UserService.EmployeeRoomAssignments.Update')
  async update(
    @Payload()
    payload: {
      id: string;
      data: { isActive?: boolean };
    }
  ) {
    return await this.employeeRoomAssignmentsService.update(
      payload.id,
      payload.data
    );
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.Delete')
  async delete(@Payload() id: string) {
    return await this.employeeRoomAssignmentsService.delete(id);
  }
}
