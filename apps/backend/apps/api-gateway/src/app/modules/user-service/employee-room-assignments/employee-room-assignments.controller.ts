import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Logger,
  UseInterceptors,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { handleError } from '@backend/shared-utils';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { Roles } from '@backend/shared-enums';
import { Public, Role } from '@backend/shared-decorators';
import { CreateEmployeeRoomAssignmentDto, FilterEmployeeRoomAssignmentDto, UpdateEmployeeRoomAssignmentDto } from '@backend/shared-domain';


@ApiTags('Employee Room Assignments')
@Controller('employee-room-assignments')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class EmployeeRoomAssignmentsController {
  private readonly logger = new Logger('EmployeeRoomAssignmentsController');

  constructor(
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userServiceClient: ClientProxy
  ) {}

  @Post()
  // @Role(Roles.SYSTEM_ADMIN)
  @Public()
  @ApiOperation({ summary: 'Create employee room assignment' })
  @ApiBody({ type: CreateEmployeeRoomAssignmentDto })
  @ApiResponse({
    status: 201,
    description: 'Gán nhân viên vào phòng thành công',
  })
  async create(
    @Body() createEmployeeRoomAssignmentDto: CreateEmployeeRoomAssignmentDto
  ) {
    try {
      this.logger.log('Creating employee room assignment');
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.Create',
          createEmployeeRoomAssignmentDto
        )
      );

      return result
    } catch (error) {
      this.logger.error('❌ Failed to create employee room assignment', error);
      throw handleError(error);
    }
  }

  @Get()
  async getEmployeeRoomAssignments() {
    return await firstValueFrom(
      this.userServiceClient.send('UserService.EmployeeRoomAssignments.FindAll', {})
    );
  }

  @Get('paginated')
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    return await firstValueFrom(
      this.userServiceClient.send('UserService.EmployeeRoomAssignments.FindMany', {
        paginationDto,
      })
    );
  }

  @Get('employee/:employeeId')
  @Role(Roles.SYSTEM_ADMIN, Roles.PHYSICIAN, Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get room assignments by employee ID' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách gán phòng theo nhân viên thành công',
  })
  async findByEmployee(@Param('employeeId') employeeId: string) {
    try {
      this.logger.log(`📋 Fetching room assignments for employee: ${employeeId}`);
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.FindByEmployee',
          employeeId
        )
      );

      return result
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch room assignments for employee: ${employeeId}`,
        error
      );
      throw handleError(error);
    }
  }

  @Get('room/:roomId')
  @Role(Roles.SYSTEM_ADMIN, Roles.PHYSICIAN, Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get employee assignments by room ID' })
  @ApiParam({ name: 'roomId', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách gán nhân viên theo phòng thành công',
  })
  async findByRoom(@Param('roomId') roomId: string) {
    try {
      this.logger.log(`📋 Fetching employee assignments for room: ${roomId}`);
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.FindByRoom',
          roomId
        )
      );

      return {
        data: result,
        count: result.length,
        message: 'Lấy danh sách gán nhân viên theo phòng thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch employee assignments for room: ${roomId}`,
        error
      );
      throw handleError(error);
    }
  }

  
  @Get(':id')
  @Role(Roles.SYSTEM_ADMIN, Roles.PHYSICIAN, Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get employee room assignment by ID' })
  @ApiParam({ name: 'id', description: 'Employee room assignment ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin gán nhân viên phòng thành công',
  })
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching employee room assignment: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.FindOne',
          id
        )
      );

      return result
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch employee room assignment: ${id}`,
        error
      );
      throw handleError(error);
    }
  }

  @Put(':id')
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update employee room assignment' })
  @ApiParam({ name: 'id', description: 'Employee room assignment ID' })
  @ApiBody({ type: UpdateEmployeeRoomAssignmentDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật gán nhân viên phòng thành công',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeRoomAssignmentDto: UpdateEmployeeRoomAssignmentDto
  ) {
    try {
      this.logger.log(`🛠️ Updating employee room assignment: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeRoomAssignments.Update', {
          id,
          data: updateEmployeeRoomAssignmentDto,
        })
      );

      return {
        data: result,
        message: 'Cập nhật gán nhân viên phòng thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to update employee room assignment: ${id}`,
        error
      );
      throw handleError(error);
    }
  }

  @Delete(':id')
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Delete employee room assignment' })
  @ApiParam({ name: 'id', description: 'Employee room assignment ID' })
  @ApiResponse({
    status: 200,
    description: 'Xóa gán nhân viên phòng thành công',
  })
  async delete(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting employee room assignment: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.Delete',
          id
        )
      );

      return {
        message: result.message || 'Xóa gán nhân viên phòng thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to delete employee room assignment: ${id}`,
        error
      );
      throw handleError(error);
    }
  }
}
