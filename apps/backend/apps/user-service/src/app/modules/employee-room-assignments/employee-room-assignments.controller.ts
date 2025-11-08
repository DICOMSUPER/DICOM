import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeRoomAssignmentsService } from './employee-room-assignments.service';
import {
  CreateEmployeeRoomAssignmentDto,
  EmployeeRoomAssignment,
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from 'libs/shared-utils/src';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from 'libs/database/src';

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
  async findAll(): Promise<EmployeeRoomAssignment[]> {
    try {
      return await this.employeeRoomAssignmentsService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all employee room assignments',
        'USER_SERVICE'
      );
    }
  }

  // find many
  @MessagePattern('UserService.EmployeeRoomAssignments.FindMany')
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<EmployeeRoomAssignment>> {
    try {
      const { paginationDto } = data;
      return await this.employeeRoomAssignmentsService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 5,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'modalityName',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find many employee room assignments`,
        'USER_SERVICE'
      );
    }
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.FindOne')
  async findOne(@Payload() id: string) {
    return await this.employeeRoomAssignmentsService.findOne(id);
  }

  // @MessagePattern('UserService.EmployeeRoomAssignments.FindByEmployee')
  // async findByEmployee(@Payload() employeeId: string) {
  //   return await this.employeeRoomAssignmentsService.findByEmployee(employeeId);
  // }

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
    return await this.employeeRoomAssignmentsService.remove(id);
  }
}
