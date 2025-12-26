import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Logger,
  UseInterceptors,
  Patch,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';
import {
  TransformInterceptor,
  RequestLoggingInterceptor,
} from '@backend/shared-interceptor';
import {
  CreateRoomScheduleDto,
  UpdateRoomScheduleDto,
} from '@backend/shared-domain';
import { AuthGuard } from '@backend/shared-guards';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';
import { Public } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';

@ApiTags('Room Schedule Management')
@Controller('room-schedules')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class RoomSchedulesController {
  private readonly logger = new Logger('RoomSchedulesController');

  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get schedules for the current authenticated user' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy lịch làm việc của user hiện tại thành công',
  })
  async getMySchedules(
    @Req() req: IAuthenticatedRequest,
    @Query('limit') limit?: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ) {
    try {
      const userId = req['userInfo'].userId;
      this.logger.log(`👤 Fetching schedules for current user: ${userId}`);

      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.RoomSchedule.FindByCurrentUser',
          {
            userId,
            limit,
            start_date: startDate,
            end_date: endDate,
          }
        )
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get schedules for current user`, error);
      throw handleError(error);
    }
  }

  // 🩺 Kiểm tra tình trạng service
  @Get('health')
  @ApiOperation({ summary: 'Check Room Schedule service health' })
  async checkHealth() {
    try {
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.Health', {})
      );

      return {
        ...result,
        message: 'Room Schedule service đang hoạt động',
      };
    } catch (error) {
      this.logger.error('❌ Room Schedule health check failed', error);
      throw handleError(error);
    }
  }

  // 📋 Lấy danh sách lịch làm việc (có phân trang và filter)
  @Get()
  @ApiOperation({
    summary: 'Get all room schedules with pagination and filters',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'employee_id',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'room_id',
    required: false,
    description: 'Filter by room ID',
  })
  @ApiQuery({
    name: 'work_date_from',
    required: false,
    description: 'Filter from date',
  })
  @ApiQuery({
    name: 'work_date_to',
    required: false,
    description: 'Filter to date',
  })
  @ApiQuery({
    name: 'schedule_status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'sort_field', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order (asc/desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách lịch làm việc thành công',
  })
  async getAllSchedules(@Query() query: any) {
    try {
      this.logger.log('📋 Fetching room schedules...');
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.FindMany', {
          paginationDto: {
            page: query.page || 1,
            limit: query.limit || 10,
            employeeId: query.employee_id,
            roomId: query.room_id,
            workDateFrom: query.work_date_from,
            workDateTo: query.work_date_to,
            startTime: query.start_time,
            endTime: query.end_time,
            scheduleStatus: query.schedule_status,
            search: query.search,
            sortField: query.sort_field,
            order: query.order,
          },
        })
      );

      this.logger.log(`✅ Retrieved ${result.total || 0} schedules`);
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch schedules', error);
      throw handleError(error);
    }
  }

  // 📋 Lấy tất cả lịch làm việc (không phân trang) - dùng cho calendar
  @Get('all')
  @ApiOperation({
    summary: 'Get all room schedules without pagination (for calendar view)',
  })
  @ApiQuery({
    name: 'employee_id',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'room_id',
    required: false,
    description: 'Filter by room ID',
  })
  @ApiQuery({
    name: 'work_date_from',
    required: false,
    description: 'Filter from date',
  })
  @ApiQuery({
    name: 'work_date_to',
    required: false,
    description: 'Filter to date',
  })
  @ApiQuery({
    name: 'start_time',
    required: false,
    description: 'Filter by start time (HH:MM)',
  })
  @ApiQuery({
    name: 'end_time',
    required: false,
    description: 'Filter by end time (HH:MM)',
  })
  @ApiQuery({
    name: 'schedule_status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    description: 'Sort field (work_date, start_time, end_time)',
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    description: 'Sort order (ASC, DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy tất cả lịch làm việc thành công',
  })
  async getAllSchedulesWithoutPagination(@Query() query: any) {
    try {
      this.logger.log('📋 Fetching all room schedules (no pagination)...');
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.FindAll', {
          filters: {
            employeeId: query.employee_id,
            roomId: query.room_id,
            workDateFrom: query.work_date_from || query.start_date,
            workDateTo: query.work_date_to || query.end_date,
            startTime: query.start_time,
            endTime: query.end_time,
            scheduleStatus: query.schedule_status,
            role: query.role,
            sortBy: query.sort_by,
            sortOrder: query.sort_order,
          },
        })
      );

      this.logger.log(`✅ Retrieved ${Array.isArray(result) ? result.length : 0} schedules`);
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch all schedules', error);
      throw handleError(error);
    }
  }

  @Get('/currentSchedule')
  async getMyCurrentWorkingSchedule(@Req() request: IAuthenticatedRequest) {
    try {
      return await firstValueFrom(
        this.userServiceClient.send(
          'UserService.RoomSchedule.GetCurrentShift',
          { userId: request.userInfo.userId }
        )
      );
    } catch (error) {
      this.logger.error('Failed to get current working schedule', error);
      throw handleError(error);
    }
  }
  // 🏠 Lấy danh sách phòng available
  @Get('available-rooms')
  @ApiOperation({ summary: 'Get available rooms for scheduling' })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date to check availability (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'time',
    required: false,
    description: 'Time to check availability (HH:MM)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phòng available thành công',
  })
  async getAvailableRooms(
    @Query('date') date: string,
    @Query('time') time?: string
  ) {
    try {
      this.logger.log(
        `🏠 Fetching available rooms for ${date}${time ? ' at ' + time : ''}`
      );
      const result = await firstValueFrom(
        this.userServiceClient.send('room.find-all', {
          page: 1,
          limit: 100,
          isActive: true,
        })
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get available rooms`, error);
      throw handleError(error);
    }
  }

  // 👥 Lấy danh sách employees available
  @Get('available-employees')
  @ApiOperation({ summary: 'Get available employees for scheduling' })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date to check availability (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'time',
    required: false,
    description: 'Time to check availability (HH:MM)',
  })
  @ApiQuery({
    name: 'startTime',
    required: false,
    description: 'Start time to check conflicts (HH:MM:SS)',
  })
  @ApiQuery({
    name: 'endTime',
    required: false,
    description: 'End time to check conflicts (HH:MM:SS)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter by department ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách employees available thành công',
  })
  async getAvailableEmployees(
    @Query('date') date: string,
    @Query('time') time?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('departmentId') departmentId?: string
  ) {
    try {
      this.logger.log(
        `👥 Fetching available employees for ${date}${
          time ? ' at ' + time : ''
        }${startTime && endTime ? ` (${startTime} - ${endTime})` : ''}${
          search ? ` search: ${search}` : ''
        }${role ? ` role: ${role}` : ''}${
          departmentId ? ` department: ${departmentId}` : ''
        }`
      );
      
      // Define allowed roles for room assignments
      const allowedRoles = [
        Roles.RADIOLOGIST,
        Roles.RECEPTION_STAFF,
        Roles.IMAGING_TECHNICIAN,
        Roles.PHYSICIAN,
      ];
      
      const result = await firstValueFrom(
        this.userServiceClient.send('user.get-all-users', {
          page: 1,
          limit: 1000,
          isActive: true,
          search,
          role,
          departmentId,
        })
      );
      
      // Extract users from response
      const usersData = result.data?.data || result.data || result;
      const users = Array.isArray(usersData) ? usersData : [];
      
      // Filter by allowed roles (only if no specific role filter is applied)
      let filteredUsers = users;
      if (!role) {
        filteredUsers = users.filter((user: any) =>
          allowedRoles.includes(user.role)
        );
      } else if (allowedRoles.includes(role as any)) {
        // If role filter is provided and it's in allowed roles, filter by it
        filteredUsers = users.filter((user: any) => user.role === role);
      } else {
        // If role filter is provided but not in allowed roles, return empty
        filteredUsers = [];
      }
      
      // Check for conflicting schedules if startTime and endTime are provided
      if (startTime && endTime) {
        const availableUsers = [];
        
        for (const user of filteredUsers) {
          try {
            const conflictCheck = await firstValueFrom(
              this.userServiceClient.send('UserService.RoomSchedule.CheckConflict', {
                employeeId: user.id,
                date,
                startTime,
                endTime,
              })
            );
            
            if (!conflictCheck?.hasConflict) {
              availableUsers.push(user);
            } else {
              this.logger.debug(
                `Employee ${user.id} has conflicting schedule on ${date}`
              );
            }
          } catch (error) {
            // If conflict check fails, include the user anyway to avoid breaking the flow
            this.logger.warn(
              `Failed to check conflict for employee ${user.id}: ${error}`
            );
            availableUsers.push(user);
          }
        }
        
        filteredUsers = availableUsers;
      }
      
      return {
        data: filteredUsers,
        count: filteredUsers.length,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to get available employees`, error);
      throw handleError(error);
    }
  }

  // 📊 Lấy stats
  @Get('stats')
  @ApiOperation({ summary: 'Get schedule statistics' })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiResponse({ status: 200, description: 'Lấy schedule stats thành công' })
  async getStats(@Query('employeeId') employeeId?: string) {
    try {
      this.logger.log(
        `📊 Fetching schedule stats${
          employeeId ? ' for employee: ' + employeeId : ''
        }`
      );
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.GetStats', {
          employeeId,
        })
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get schedule stats`, error);
      throw handleError(error);
    }
  }

  // 📋 Lấy shift templates
  @Get('shift-templates')
  @ApiOperation({ summary: 'Get shift templates' })
  @ApiResponse({ status: 200, description: 'Lấy shift templates thành công' })
  async getShiftTemplates() {
    try {
      this.logger.log(`📋 Fetching shift templates`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.ShiftTemplate.FindMany', {
          paginationDto: { page: 1, limit: 100 },
        })
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get shift templates`, error);
      throw handleError(error);
    }
  }

  // 🆕 Tạo lịch làm việc mới
  @Post()
  @ApiOperation({ summary: 'Create a new room schedule' })
  @ApiBody({ type: CreateRoomScheduleDto })
  @ApiResponse({ status: 201, description: 'Tạo lịch làm việc thành công' })
  @Public()
  async createSchedule(@Body() createScheduleDto: CreateRoomScheduleDto) {
    try {
      this.logger.log(
        `🏗️ Creating schedule on ${createScheduleDto.work_date} for room: ${
          createScheduleDto.room_id || 'N/A'
        }`
      );
      const result = await firstValueFrom(
        this.userServiceClient.send(
          'UserService.RoomSchedule.Create',
          createScheduleDto
        )
      );

      return {
        schedule: result,
        message: 'Tạo lịch làm việc thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Schedule creation failed`, error);
      throw handleError(error);
    }
  }

  // 🔍 Lấy chi tiết 1 lịch làm việc - MUST BE LAST to avoid catching other routes
  @Get(':id')
  @ApiOperation({ summary: 'Get room schedule by ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin lịch làm việc thành công',
  })
  async getScheduleById(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching schedule by ID: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.FindOne', {
          id,
        })
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get schedule by ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // ✏️ Cập nhật lịch làm việc
  @Patch(':id')
  @ApiOperation({ summary: 'Update room schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiBody({ type: UpdateRoomScheduleDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật lịch làm việc thành công',
  })
  async updateSchedule(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateRoomScheduleDto
  ) {
    try {
      this.logger.log(`🛠️ Updating schedule ID: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.Update', {
          id,
          updateDto: updateScheduleDto,
        })
      );

      return {
        schedule: result,
        message: 'Cập nhật lịch làm việc thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to update schedule ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // 🗑️ Xóa lịch làm việc
  @Delete(':id')
  @ApiOperation({ summary: 'Delete room schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Xóa lịch làm việc thành công' })
  async deleteSchedule(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting schedule ID: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.Delete', {
          id,
        })
      );

      return {
        message: result.message || 'Xóa lịch làm việc thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete schedule ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // 📦 Tạo nhiều lịch làm việc cùng lúc
  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple room schedules' })
  @ApiBody({ type: [CreateRoomScheduleDto] })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhiều lịch làm việc thành công',
  })
  async createBulkSchedules(@Body() schedules: CreateRoomScheduleDto[]) {
    try {
      this.logger.log(`📦 Creating ${schedules.length} schedules in bulk`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.CreateBulk', {
          schedules,
        })
      );

      return {
        schedules: result,
        message: `Tạo ${schedules.length} lịch làm việc thành công`,
      };
    } catch (error) {
      this.logger.error(`❌ Bulk schedule creation failed`, error);
      throw handleError(error);
    }
  }

  // 🔄 Cập nhật nhiều lịch làm việc cùng lúc
  @Patch('bulk')
  @ApiOperation({ summary: 'Update multiple room schedules' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật nhiều lịch làm việc thành công',
  })
  async updateBulkSchedules(
    @Body() updates: { id: string; data: UpdateRoomScheduleDto }[]
  ) {
    try {
      this.logger.log(`🔄 Updating ${updates.length} schedules in bulk`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.RoomSchedule.UpdateBulk', {
          updates,
        })
      );

      return {
        schedules: result,
        message: `Cập nhật ${updates.length} lịch làm việc thành công`,
      };
    } catch (error) {
      this.logger.error(`❌ Bulk schedule update failed`, error);
      throw handleError(error);
    }
  }

  // 🗑️ Xóa nhiều lịch làm việc cùng lúc
  @Delete('bulk')
  @ApiOperation({ summary: 'Delete multiple room schedules' })
  @ApiResponse({
    status: 200,
    description: 'Xóa nhiều lịch làm việc thành công',
  })
  async deleteBulkSchedules(@Body() data: { ids: string[] }) {
    try {
      this.logger.log(`🗑️ Deleting ${data.ids.length} schedules in bulk`);
      await firstValueFrom(
        this.userServiceClient.send(
          'UserService.RoomSchedule.DeleteBulk',
          data
        )
      );

      return {
        message: `Xóa ${data.ids.length} lịch làm việc thành công`,
      };
    } catch (error) {
      this.logger.error(`❌ Bulk schedule deletion failed`, error);
      throw handleError(error);
    }
  }
}
