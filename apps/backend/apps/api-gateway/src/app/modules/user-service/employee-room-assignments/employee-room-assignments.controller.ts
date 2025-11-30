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
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { handleError } from '@backend/shared-utils';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import { Roles } from '@backend/shared-enums';
import { Public, Role } from '@backend/shared-decorators';
import {
  CreateEmployeeRoomAssignmentDto,
  FilterEmployeeRoomAssignmentDto,
  UpdateEmployeeRoomAssignmentDto,
} from '@backend/shared-domain';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';

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

      return result;
    } catch (error) {
      this.logger.error('❌ Failed to create employee room assignment', error);
      throw handleError(error);
    }
  }

  @Post('bulk')
  // @Role(Roles.SYSTEM_ADMIN)
  @Public()
  @ApiOperation({ summary: 'Create bulk employee room assignments' })
  @ApiBody({ type: [CreateEmployeeRoomAssignmentDto] })
  @ApiResponse({
    status: 201,
    description: 'Gán nhiều nhân viên vào phòng thành công',
  })
  async createBulk(@Body() assignments: CreateEmployeeRoomAssignmentDto[]) {
    try {
      this.logger.log(
        `Creating bulk employee room assignments: ${assignments.length} assignments`
      );
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.CreateBulk',
          { assignments }
        )
      );

      return {
        data: result,
        count: result?.length || 0,
        message: `Successfully created ${result?.length || 0} assignments`,
      };
    } catch (error) {
      this.logger.error(
        '❌ Failed to create bulk employee room assignments',
        error
      );
      throw handleError(error);
    }
  }

  @Get()
  @Public()
  async getEmployeeRoomAssignments(
    @Query() filter?: FilterEmployeeRoomAssignmentDto
  ) {
    return await firstValueFrom(
      this.userServiceClient.send(
        'UserService.EmployeeRoomAssignments.FindAll',
        {
          filter,
        }
      )
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
      this.userServiceClient.send(
        'UserService.EmployeeRoomAssignments.FindMany',
        {
          paginationDto,
        }
      )
    );
  }

  @Get('current-session')
  @Role(
    Roles.PHYSICIAN,
    Roles.RECEPTION_STAFF,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST
  )
  @ApiOperation({ summary: 'Get room assignments by employee ID' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách gán phòng theo nhân viên thành công',
  })
  async findByEmployeeInCurrentSession(@Req() req: IAuthenticatedRequest) {
    try {
      const employeeId = req.userInfo.userId;
      console.log('employee apigate way', employeeId);

      this.logger.log(
        `📋 Fetching room assignments for employee: ${employeeId}`
      );
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.FindByEmployeeInCurrentSession',
          employeeId
        )
      );
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch room assignments for employee: ${req.userInfo.userId}`,
        error
      );
      throw handleError(error);
    }
  }

  @Get('current-session-in-room/:roomId')
  @Role(
    Roles.PHYSICIAN,
    Roles.RECEPTION_STAFF,
    Roles.IMAGING_TECHNICIAN,
    Roles.RADIOLOGIST
  )
  @ApiOperation({ summary: 'Get room assignments by room id' })
  @ApiParam({ name: 'roomId', description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách gán phòng theo phòng thành công',
  })
  async findByRoomInCurrentSession(@Param('roomId') roomId: string) {
    try {
      console.log('roomId api gateway', roomId);
      this.logger.log(`📋 Fetching room assignments for room: ${roomId}`);
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.FindByRoomInCurrentSession',
          roomId
        )
      );
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch room assignments for room: ${roomId}`,
        error
      );
      throw handleError(error);
    }
  }

  @Role(
    Roles.IMAGING_TECHNICIAN,
    Roles.PHYSICIAN,
    Roles.RADIOLOGIST,
    Roles.RECEPTION_STAFF,
    Roles.SYSTEM_ADMIN
  )
  @Get('stats/employee')
  async getEmployeeRoomAssignmentStats(
    @Req() req: IAuthenticatedRequest,
    @Query('startDate') startDate?: Date | string,
    @Query('endDate') endDate?: Date | string
  ) {
    return await firstValueFrom(
      this.userServiceClient.send(
        'UserService.EmployeeRoomAssignments.StatsOverTime',
        { employeeId: req?.userInfo?.userId, startDate, endDate }
      )
    );
  }

  @Get('stats')
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get employee room assignment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê gán nhân viên phòng thành công',
  })
  async getStats() {
    try {
      return await firstValueFrom(
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.GetStats',
          {}
        )
      );
    } catch (error) {
      this.logger.error(
        '❌ Failed to fetch employee room assignment stats',
        error
      );
      throw handleError(error);
    }
  }

  @Role(Roles.IMAGING_TECHNICIAN, Roles.PHYSICIAN, Roles.RADIOLOGIST)
  @Get('by-date')
  async findEmployeeRoomAssignmentForEmployeeInWorkDate(
    @Req() req: IAuthenticatedRequest,
    @Query('work_date') work_date: string | Date
  ) {
    return await firstValueFrom(
      this.userServiceClient.send(
        'UserService.EmployeeRoomAssignments.FindEmployeeRoomAssignmentForEmployeeInWorkDate',
        { id: req.userInfo.userId, work_date }
      )
    );
  }

  @Get('room/:roomId')
  @Role(
    Roles.SYSTEM_ADMIN,
    Roles.PHYSICIAN,
    Roles.RECEPTION_STAFF,
    Roles.IMAGING_TECHNICIAN
  )
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

  @Get('/:id/user')
  async getCurrentEmployeeRoomAssignment(@Param('id') id: string) {
    return await firstValueFrom(
      this.userServiceClient.send(
        'UserService.EmployeeRoomAssignments.FindCurrent',
        { id }
      )
    );
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

      return result;
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
        this.userServiceClient.send(
          'UserService.EmployeeRoomAssignments.Update',
          {
            id,
            data: updateEmployeeRoomAssignmentDto,
          }
        )
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
