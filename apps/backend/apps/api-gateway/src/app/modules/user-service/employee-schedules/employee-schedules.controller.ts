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
  UseGuards
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';
import { TransformInterceptor, RequestLoggingInterceptor } from '@backend/shared-interceptor';
import { 
  CreateEmployeeScheduleDto, 
  UpdateEmployeeScheduleDto
} from '@backend/shared-domain';
import { AuthGuard } from '@backend/shared-guards';
import type { IAuthenticatedRequest } from '@backend/shared-interfaces';

@ApiTags('Employee Schedule Management')
@Controller('employee-schedules')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class EmployeeSchedulesController {
  private readonly logger = new Logger('EmployeeSchedulesController');

  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  // 👤 Lấy lịch làm việc của user hiện tại
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get schedules for the current authenticated user' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  @ApiQuery({ name: 'start_date', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lấy lịch làm việc của user hiện tại thành công' })
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
        this.userServiceClient.send('UserService.EmployeeSchedule.FindByCurrentUser', { 
          userId, 
          limit,
          start_date: startDate,
          end_date: endDate
        })
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get schedules for current user`, error);
      throw handleError(error);
    }
  }

  // 🩺 Kiểm tra tình trạng service
  @Get('health')
  @ApiOperation({ summary: 'Check Employee Schedule service health' })
  async checkHealth() {
    try {
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.Health', {})
      );

      return {
        ...result,
        message: 'Employee Schedule service đang hoạt động',
      };
    } catch (error) {
      this.logger.error('❌ Employee Schedule health check failed', error);
      throw handleError(error);
    }
  }

  // 📋 Lấy danh sách lịch làm việc (có phân trang và filter)
  @Get()
  @ApiOperation({ summary: 'Get all employee schedules with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'employee_id', required: false, description: 'Filter by employee ID' })
  @ApiQuery({ name: 'room_id', required: false, description: 'Filter by room ID' })
  @ApiQuery({ name: 'work_date_from', required: false, description: 'Filter from date' })
  @ApiQuery({ name: 'work_date_to', required: false, description: 'Filter to date' })
  @ApiQuery({ name: 'schedule_status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'sort_field', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (asc/desc)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách lịch làm việc thành công' })
  async getAllSchedules(@Query() query: any) {
    try {
      this.logger.log('📋 Fetching employee schedules...');
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.FindMany', { 
          paginationDto: {
            page: query.page || 1,
            limit: query.limit || 10,
            ...query
          }
        })
      );

      this.logger.log(`✅ Retrieved ${result.count || 0} schedules`);
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch schedules', error);
      throw handleError(error);
    }
  }

  // 🆕 Tạo lịch làm việc mới
  @Post()
  @ApiOperation({ summary: 'Create a new employee schedule' })
  @ApiBody({ type: CreateEmployeeScheduleDto })
  @ApiResponse({ status: 201, description: 'Tạo lịch làm việc thành công' })
  async createSchedule(@Body() createScheduleDto: CreateEmployeeScheduleDto) {
    try {
      this.logger.log(`🏗️ Creating schedule for employee: ${createScheduleDto.employee_id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.Create', createScheduleDto)
      );

      return {
        schedule: result,
        message: 'Tạo lịch làm việc thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Schedule creation failed for employee: ${createScheduleDto.employee_id}`, error);
      throw handleError(error);
    }
  }

  // 🔍 Lấy chi tiết 1 lịch làm việc
  @Get(':id')
  @ApiOperation({ summary: 'Get employee schedule by ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin lịch làm việc thành công' })
  async getScheduleById(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching schedule by ID: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.FindOne', { id })
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get schedule by ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // ✏️ Cập nhật lịch làm việc
  @Patch(':id')
  @ApiOperation({ summary: 'Update employee schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiBody({ type: UpdateEmployeeScheduleDto })
  @ApiResponse({ status: 200, description: 'Cập nhật lịch làm việc thành công' })
  async updateSchedule(@Param('id') id: string, @Body() updateScheduleDto: UpdateEmployeeScheduleDto) {
    try {
      this.logger.log(`🛠️ Updating schedule ID: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.Update', { id, updateDto: updateScheduleDto })
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
  @ApiOperation({ summary: 'Delete employee schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({ status: 200, description: 'Xóa lịch làm việc thành công' })
  async deleteSchedule(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting schedule ID: ${id}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.Delete', { id })
      );

      return {
        message: result.message || 'Xóa lịch làm việc thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete schedule ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // 👤 Lấy lịch làm việc theo nhân viên
  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get schedules by employee ID' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results' })
  @ApiResponse({ status: 200, description: 'Lấy lịch làm việc theo nhân viên thành công' })
  async getSchedulesByEmployee(@Param('employeeId') employeeId: string, @Query('limit') limit?: number) {
    try {
      this.logger.log(`👤 Fetching schedules for employee: ${employeeId}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.FindByEmployee', { employeeId, limit })
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get schedules for employee: ${employeeId}`, error);
      throw handleError(error);
    }
  }

  // 📅 Lấy lịch làm việc theo khoảng thời gian
  @Get('date-range/range')
  @ApiOperation({ summary: 'Get schedules by date range' })
  @ApiQuery({ name: 'start_date', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'employee_id', required: false, description: 'Filter by employee ID' })
  @ApiResponse({ status: 200, description: 'Lấy lịch làm việc theo khoảng thời gian thành công' })
  async getSchedulesByDateRange(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('employee_id') employeeId?: string
  ) {
    try {
      this.logger.log(`📅 Fetching schedules from ${startDate} to ${endDate}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.FindByDateRange', { 
          start_date: startDate, 
          end_date: endDate, 
          employee_id: employeeId 
        })
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get schedules by date range`, error);
      throw handleError(error);
    }
  }

  // 🏥 Lấy lịch làm việc theo phòng và ngày
  @Get('room-date/room')
  @ApiOperation({ summary: 'Get schedules by room and date' })
  @ApiQuery({ name: 'room_id', description: 'Room ID' })
  @ApiQuery({ name: 'work_date', description: 'Work date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lấy lịch làm việc theo phòng và ngày thành công' })
  async getSchedulesByRoomAndDate(
    @Query('room_id') roomId: string,
    @Query('work_date') workDate: string
  ) {
    try {
      this.logger.log(`🏥 Fetching schedules for room ${roomId} on ${workDate}`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.FindByRoomAndDate', { 
          room_id: roomId, 
          work_date: workDate 
        })
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get schedules by room and date`, error);
      throw handleError(error);
    }
  }

  // 📦 Tạo nhiều lịch làm việc cùng lúc
  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple employee schedules' })
  @ApiBody({ type: [CreateEmployeeScheduleDto] })
  @ApiResponse({ status: 201, description: 'Tạo nhiều lịch làm việc thành công' })
  async createBulkSchedules(@Body() schedules: CreateEmployeeScheduleDto[]) {
    try {
      this.logger.log(`📦 Creating ${schedules.length} schedules in bulk`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.CreateBulk', { schedules })
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
  @ApiOperation({ summary: 'Update multiple employee schedules' })
  @ApiResponse({ status: 200, description: 'Cập nhật nhiều lịch làm việc thành công' })
  async updateBulkSchedules(@Body() updates: { id: string; data: UpdateEmployeeScheduleDto }[]) {
    try {
      this.logger.log(`🔄 Updating ${updates.length} schedules in bulk`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.UpdateBulk', { updates })
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
  @ApiOperation({ summary: 'Delete multiple employee schedules' })
  @ApiResponse({ status: 200, description: 'Xóa nhiều lịch làm việc thành công' })
  async deleteBulkSchedules(@Body() data: { ids: string[] }) {
    try {
      this.logger.log(`🗑️ Deleting ${data.ids.length} schedules in bulk`);
      const result = await firstValueFrom(
        this.userServiceClient.send('UserService.EmployeeSchedule.DeleteBulk', data)
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
