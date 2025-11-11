import { Controller, Logger } from '@nestjs/common';
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
  private logger = new Logger('UserService');
  constructor(
    private readonly employeeRoomAssignmentsService: EmployeeRoomAssignmentsService
  ) {}

  @MessagePattern('UserService.EmployeeRoomAssignments.Create')
  async create(
    @Payload()
    data: CreateEmployeeRoomAssignmentDto
  ) {
    this.logger.log(
      'Using pattern: UserService.EmployeeRoomAssignments.Create'
    );
    try {
      return await this.employeeRoomAssignmentsService.create(data);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create employee room assignment',
        'USER_SERVICE'
      );
    }
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
    this.logger.log(
      'Using pattern: UserService.EmployeeRoomAssignments.FindMany'
    );
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
    this.logger.log(
      'Using pattern: UserService.EmployeeRoomAssignments.FindOne'
    );
    try {
      return await this.employeeRoomAssignmentsService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find one employee room assignment',
        'USER_SERVICE'
      );
    }
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.FindByEmployee')
  async findByEmployee(@Payload() employeeId: string) {
    try {
      this.logger.log(
        'Using pattern: UserService.EmployeeRoomAssignments.FindByEmployee'
      );
      return await this.employeeRoomAssignmentsService.findByEmployee(
        employeeId
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find employee room assignment by employeeId',
        'USER_SERVICE'
      );
    }
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.Update')
  async update(
    @Payload()
    payload: {
      id: string;
      data: { isActive?: boolean };
    }
  ) {
    this.logger.log(
      'Using pattern: UserService.EmployeeRoomAssignments.Update'
    );
    try {
      return await this.employeeRoomAssignmentsService.update(
        payload.id,
        payload.data
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to update employee room assignment',
        'USER_SERVICE'
      );
    }
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.Delete')
  async delete(@Payload() id: string) {
    this.logger.log(
      'Using pattern: UserService.EmployeeRoomAssignments.Delete'
    );
    try {
      return await this.employeeRoomAssignmentsService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to delete employee room assignment',
        'USER_SERVICE'
      );
    }
  }

  @MessagePattern('UserService.EmployeeRoomAssignments.FindCurrent')
  async findCurrentEmployeeAssignment(@Payload() data: { id: string }) {
    this.logger.log(
      'Using pattern: UserService.EmployeeRoomAssignments.FindCurrent'
    );
    try {
      return await this.employeeRoomAssignmentsService.findCurrentEmployeeAssignment(
        data.id
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find currrent employee room assignment',
        'USER_SERVICE'
      );
    }
  }
}
