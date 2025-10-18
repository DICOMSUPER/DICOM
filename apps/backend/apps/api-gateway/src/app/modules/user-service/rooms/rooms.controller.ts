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
  Search,
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
import { CreateRoomDto } from '@backend/shared-domain';
import { UpdateRoomDto } from '@backend/shared-domain';
import { Roles } from '@backend/shared-enums';
import { Public } from '@backend/shared-decorators';
import { Role } from '@backend/shared-decorators';

@ApiTags('Room Management')
@Controller('rooms')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class RoomsController {
  private readonly logger = new Logger('RoomsController');

  constructor(
    @Inject('USER_SERVICE') private readonly roomClient: ClientProxy
  ) {}

  // 🩺 Kiểm tra tình trạng service

  @Get('health')
  @ApiOperation({ summary: 'Check Room service health' })
  async checkHealth() {
    try {
      const result = await firstValueFrom(
        this.roomClient.send('room.check-health', {})
      );

      return {
        ...result,
        message: 'Room service đang hoạt động',
      };
    } catch (error) {
      this.logger.error('❌ Room health check failed', error);
      throw handleError(error);
    }
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách phòng thành công' })
  async getAllRooms(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    try {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 10;

      this.logger.log(
        `📋 Fetching rooms - Page: ${pageNum}, Limit: ${limitNum}`
      );

      const result = await firstValueFrom(
        this.roomClient.send('room.get-all', {
          page: pageNum,
          limit: limitNum,
          search,
          status,
        })
      );

      this.logger.log(
        `✅ Retrieved ${result.data?.length || 0} rooms (Total: ${
          result.total || 0
        })`
      );

      return {
        data: result.data,
        count: result.total || result.data?.length || 0,
        message: 'Lấy danh sách phòng thành công',
      };
    } catch (error) {
      this.logger.error('❌ Failed to fetch rooms', error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: 'Tạo phòng thành công' })
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    try {
      this.logger.log(`🏗️ Creating room: ${createRoomDto.roomCode}`);
      const result = await firstValueFrom(
        this.roomClient.send('room.create', createRoomDto)
      );

      return {
        room: result.room,
        message: result.message || 'Tạo phòng thành công',
      };
    } catch (error) {
      this.logger.error(
        `❌ Room creation failed for: ${createRoomDto.roomCode}`,
        error
      );
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN, Roles.RECEPTION_STAFF, Roles.PHYSICIAN)
  @Get(':id/department')
  @ApiOperation({ summary: 'Get rooms by departmentID' })
  @ApiParam({ name: 'id', description: 'department ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách phòng theo department thành công',
  })
  async getRoomByDepartmentId(
    @Param('id') id: string,
    @Query('search') search?: string,
    @Query('applyScheduleFilter') applyScheduleFilter?: boolean
  ) {
    return await firstValueFrom(
      this.roomClient.send('UserService.Room.GetRoomByDepartmentId', {
        id,
        applyScheduleFilter,
        search: search || '',
      })
    );
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin phòng thành công' })
  async getRoomById(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching room by ID: ${id}`);
      const result = await firstValueFrom(
        this.roomClient.send('room.get-by-id', { id })
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get room by ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update room details' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, description: 'Cập nhật phòng thành công' })
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto
  ) {
    try {
      this.logger.log(`🛠️ Updating room ID: ${id}`);
      const result = await firstValueFrom(
        this.roomClient.send('room.update', { id, updateRoomDto })
      );

      return {
        room: result.room,
        message: result.message || 'Cập nhật phòng thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to update room ID: ${id}`, error);
      throw handleError(error);
    }
  }

  @Role(Roles.SYSTEM_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Xóa phòng thành công' })
  async deleteRoom(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting room ID: ${id}`);
      const result = await firstValueFrom(
        this.roomClient.send('room.delete', { id })
      );

      return {
        message: result.message || 'Xóa phòng thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete room ID: ${id}`, error);
      throw handleError(error);
    }
  }
}
