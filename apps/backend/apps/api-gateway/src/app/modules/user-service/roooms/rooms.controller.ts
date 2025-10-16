import { RequestLoggingInterceptor, TransformInterceptor } from '@backend/shared-interceptor';
import { handleError } from '@backend/shared-utils';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  UseInterceptors
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';


import { CreateRoomDto, UpdateRoomDto } from '@backend/shared-domain';


@ApiTags('Room Management')
@Controller('rooms')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class RoomsController {
  private readonly logger = new Logger('RoomsController');

  constructor(
    @Inject('USER_SERVICE') private readonly roomClient: ClientProxy,
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

  
  @Get()

  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách phòng thành công' })
  async getAllRooms() {
    try {
      this.logger.log('📋 Fetching all rooms...');
      const result = await firstValueFrom(
        this.roomClient.send('room.get-all', {})
      );

      this.logger.log(`✅ Retrieved ${result.count || 0} rooms`);
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch rooms', error);
      throw handleError(error);
    }
  }

  // 🆕 Tạo phòng mới
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
      this.logger.error(`❌ Room creation failed for: ${createRoomDto.roomCode}`, error);
      throw handleError(error);
    }
  }

  // 🔍 Lấy chi tiết 1 phòng
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

  // ✏️ Cập nhật thông tin phòng
  @Put(':id')
  @ApiOperation({ summary: 'Update room details' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, description: 'Cập nhật phòng thành công' })
  async updateRoom(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
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

  // 🗑️ Xóa phòng
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
