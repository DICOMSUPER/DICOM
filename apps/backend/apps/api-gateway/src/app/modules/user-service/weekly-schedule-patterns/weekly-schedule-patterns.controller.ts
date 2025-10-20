import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  Query,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { TransformInterceptor, RequestLoggingInterceptor } from '@backend/shared-interceptor';
import { handleError } from '@backend/shared-utils';
import {
  CreateWeeklySchedulePatternDto,
  UpdateWeeklySchedulePatternDto,
} from '@backend/shared-domain';
import { Role, Public } from '@backend/shared-decorators';
import { Roles } from '@backend/shared-enums';

@ApiTags('Weekly Schedule Patterns')
@Controller('weekly-schedule-patterns')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class WeeklySchedulePatternsController {
  private readonly logger = new Logger('WeeklySchedulePatternsController');

  constructor(
    @Inject('USER_SERVICE')
    private readonly scheduleClient: ClientProxy,
  ) {}

  // 🩺 Kiểm tra tình trạng service
  @Get('health')
  @ApiOperation({ summary: 'Check Weekly Schedule Patterns service health' })
  async checkHealth() {
    try {
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.check-health', {}),
      );
      return { ...result, message: 'Weekly Schedule Patterns service đang hoạt động' };
    } catch (error) {
      this.logger.error('❌ Health check failed', error);
      throw handleError(error);
    }
  }

  // 🧾 Lấy danh sách tất cả
  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mẫu lịch tuần' })
  @ApiResponse({ status: 200, description: 'Danh sách mẫu lịch tuần' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('dayOfWeek') dayOfWeek?: number,
    @Query('isActive') isActive?: boolean,
  ) {
    try {
      this.logger.log('📋 Fetching weekly schedule patterns list');
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.get-all', {
          page,
          limit,
          userId,
          dayOfWeek,
          isActive,
        }),
      );

      this.logger.log(`✅ Retrieved ${result.data?.length || 0} schedule patterns`);
      return {
        data: result.data,
        count: result.total || result.data?.length || 0,
        message: 'Lấy danh sách mẫu lịch tuần thành công',
      };
    } catch (error) {
      this.logger.error('❌ Failed to fetch weekly schedule patterns', error);
      throw handleError(error);
    }
  }

  // 🔍 Lấy theo ID
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết mẫu lịch tuần' })
  @ApiParam({ name: 'id', description: 'Weekly Schedule Pattern ID' })
  @ApiResponse({ status: 200, description: 'Thông tin mẫu lịch tuần' })
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching weekly schedule pattern by ID: ${id}`);
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.get-by-id', { id }),
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get weekly schedule pattern by ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // 👤 Lấy danh sách theo user
  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy danh sách mẫu lịch tuần theo người dùng' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Danh sách mẫu lịch tuần của người dùng' })
  async findByUser(@Param('userId') userId: string) {
    try {
      this.logger.log(`👤 Fetching patterns for user ID: ${userId}`);
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.get-by-user', { userId }),
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get patterns by user: ${userId}`, error);
      throw handleError(error);
    }
  }

  // 🏗️ Tạo mới
  @Role(Roles.SYSTEM_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Tạo mẫu lịch tuần mới' })
  @ApiBody({ type: CreateWeeklySchedulePatternDto })
  @ApiResponse({ status: 201, description: 'Tạo mẫu lịch tuần thành công' })
  async create(@Body() createDto: CreateWeeklySchedulePatternDto) {
    try {
      this.logger.log(`🏗️ Creating weekly schedule pattern`);
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.create', createDto),
      );

      return {
        data: result.data,
        message: result.message || 'Tạo mẫu lịch tuần thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Weekly schedule pattern creation failed`, error);
      throw handleError(error);
    }
  }

  // 🛠️ Cập nhật
  @Role(Roles.SYSTEM_ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin mẫu lịch tuần' })
  @ApiParam({ name: 'id', description: 'Weekly Schedule Pattern ID' })
  @ApiBody({ type: UpdateWeeklySchedulePatternDto })
  @ApiResponse({ status: 200, description: 'Cập nhật mẫu lịch tuần thành công' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateWeeklySchedulePatternDto) {
    try {
      this.logger.log(`🛠️ Updating weekly schedule pattern ID: ${id}`);
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.update', { id, updateDto }),
      );

      return {
        data: result.data,
        message: result.message || 'Cập nhật mẫu lịch tuần thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to update weekly schedule pattern ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // 🗑️ Xóa
  @Role(Roles.SYSTEM_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mẫu lịch tuần' })
  @ApiParam({ name: 'id', description: 'Weekly Schedule Pattern ID' })
  @ApiResponse({ status: 200, description: 'Xóa mẫu lịch tuần thành công' })
  async remove(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting weekly schedule pattern ID: ${id}`);
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.delete', { id }),
      );

      return {
        message: result.message || 'Xóa mẫu lịch tuần thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete weekly schedule pattern ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // 🚫 Vô hiệu hóa
  @Role(Roles.SYSTEM_ADMIN)
  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Vô hiệu hóa mẫu lịch tuần' })
  async deactivate(@Param('id') id: string) {
    try {
      this.logger.log(`🚫 Deactivating weekly schedule pattern ID: ${id}`);
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.deactivate', { id }),
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to deactivate weekly schedule pattern ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // ✅ Kích hoạt lại
  @Role(Roles.SYSTEM_ADMIN)
  @Put(':id/activate')
  @ApiOperation({ summary: 'Kích hoạt mẫu lịch tuần' })
  async activate(@Param('id') id: string) {
    try {
      this.logger.log(`✅ Activating weekly schedule pattern ID: ${id}`);
      const result = await firstValueFrom(
        this.scheduleClient.send('weekly-schedule-pattern.activate', { id }),
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to activate weekly schedule pattern ID: ${id}`, error);
      throw handleError(error);
    }
  }
}
