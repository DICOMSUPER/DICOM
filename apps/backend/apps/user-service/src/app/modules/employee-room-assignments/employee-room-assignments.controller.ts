import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeRoomAssignmentsService } from './employee-room-assignments.service';
import {
  CreateEmployeeRoomAssignmentDto,
  EmployeeRoomAssignment,
  FilterEmployeeRoomAssignmentDto,
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';

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
    data: { filter?: FilterEmployeeRoomAssignmentDto }
  ): Promise<EmployeeRoomAssignment[]> {
    try {
      return await this.employeeRoomAssignmentsService.findAll(data.filter);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all employee room assignments',
        'USER_SERVICE'
      );
    }
  }

  @MessagePattern(
    'UserService.EmployeeRoomAssignments.FindByEmployeeInCurrentSession'
  )
  async findByEmployeeInCurrentSession(
    @Payload() employeeId: string
  ): Promise<EmployeeRoomAssignment[]> {
    try {
      return await this.employeeRoomAssignmentsService.findByEmployeeInCurrentSession(
        employeeId
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find employee room assignments in current session',
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
