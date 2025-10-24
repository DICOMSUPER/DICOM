import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from '@backend/shared-domain';
import { UpdateRoomDto } from '@backend/shared-domain';
import {
  RoomNotFoundException,
  RoomAlreadyExistsException,
  RoomCreationFailedException,
  RoomUpdateFailedException,
  RoomDeletionFailedException,
  InvalidRoomDataException,
} from '@backend/shared-exception';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller()
export class RoomsController {
  private readonly logger = new Logger('RoomsController');

  constructor(private readonly roomsService: RoomsService) {}

  // Kiểm tra tình trạng service
  @MessagePattern('room.check-health')
  async checkHealth() {
    return {
      service: 'RoomService',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  // Tạo phòng mới
  @MessagePattern('room.create')
  async create(@Payload() createRoomDto: CreateRoomDto) {
    try {
      this.logger.log(`Creating room: ${createRoomDto.roomCode}`);

      const room = await this.roomsService.create(createRoomDto);
      if (!room) {
        throw new RoomCreationFailedException('Không thể tạo phòng');
      }

      return {
        room,
        message: 'Tạo phòng thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Room creation error: ${(error as Error).message}`);
      if (
        error instanceof RoomAlreadyExistsException ||
        error instanceof InvalidRoomDataException ||
        error instanceof RoomCreationFailedException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Room creation failed',
        'RoomsController.create'
      );
    }
  }

  // Lấy toàn bộ danh sách phòng
  @MessagePattern('room.get-all')
  async findAll(
    @Payload()
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }
  ) {
    try {
      const result = await this.roomsService.findAll(query || {});
      return result;
    } catch (error) {
      this.logger.error(`Get all rooms error: ${(error as Error).message}`);
      handleErrorFromMicroservices(
        error,
        'Failed to get rooms',
        'RoomsController.findAll'
      );
    }
  }

  // Lấy chi tiết 1 phòng
  @MessagePattern('room.get-by-id')
  async findOne(@Payload() data: { id: string }) {
    try {
      this.logger.log(`Fetching room by ID: ${data.id}`);
      const room = await this.roomsService.findOne(data.id);

      if (!room) {
        throw new RoomNotFoundException(
          `Không tìm thấy phòng với ID ${data.id}`
        );
      }

      return {
        room,
        message: 'Lấy thông tin phòng thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Get room by ID error: ${(error as Error).message}`);
      if (error instanceof RoomNotFoundException) throw error;
      handleErrorFromMicroservices(
        error,
        'Failed to get room by ID',
        'RoomsController.findOne'
      );
    }
  }

  // Cập nhật thông tin phòng
  @MessagePattern('room.update')
  async update(@Payload() data: { id: string; updateRoomDto: UpdateRoomDto }) {
    try {
      this.logger.log(`Updating room ID: ${data.id}`);

      const room = await this.roomsService.update(data.id, data.updateRoomDto);
      if (!room) {
        throw new RoomNotFoundException(
          `Không tìm thấy phòng với ID ${data.id}`
        );
      }

      return {
        room,
        message: 'Cập nhật phòng thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Update room error: ${(error as Error).message}`);
      if (
        error instanceof RoomNotFoundException ||
        error instanceof RoomAlreadyExistsException ||
        error instanceof RoomUpdateFailedException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Failed to update room',
        'RoomsController.update'
      );
    }
  }

  // Xóa phòng
  @MessagePattern('room.delete')
  async remove(@Payload() data: { id: string }) {
    try {
      this.logger.log(`Deleting room ID: ${data.id}`);

      const result = await this.roomsService.remove(data.id);
      if (!result) {
        throw new RoomNotFoundException(`Không tìm thấy phòng để xóa`);
      }

      return {
        message: 'Xóa phòng thành công',
      };
    } catch (error: unknown) {
      this.logger.error(`Delete room error: ${(error as Error).message}`);
      if (
        error instanceof RoomNotFoundException ||
        error instanceof RoomDeletionFailedException
      ) {
        throw error;
      }
      handleErrorFromMicroservices(
        error,
        'Failed to delete room',
        'RoomsController.remove'
      );
    }
  }

  @MessagePattern('UserService.Room.GetRoomByDepartmentId')
  async getRoomByDepartmentId(
    @Payload()
    data: {
      id: string;
      applyScheduleFilter: boolean;
      search?: string;
    }
  ) {
    this.logger.log('Using pattern: UserService.Room.GetRoomByDepartmentId');
    try {
      const { id, search, applyScheduleFilter } = data;
      return await this.roomsService.getRoomByDepartmentId(
        id,
        applyScheduleFilter || false,
        search || ''
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed tto get room by departmentId',
        'UserService'
      );
    }
  }

  @MessagePattern('UserService.Rooms.GetIds')
  async getRoomIds(
    @Payload() data: { take?: number; isActive?: boolean }
  ): Promise<{ success: boolean; data: string[]; count: number }> {
    this.logger.log(
      `Getting room IDs, take: ${data.take || 10}, isActive: ${
        data.isActive !== false
      }`
    );
    try {
      const { take = 10, isActive = true } = data;
      const result = await this.roomsService.findAll({
        limit: take,
        isActive,
      });

      // Ensure result.data is an array
      const rooms = Array.isArray(result.data)
        ? result.data
        : result.data
        ? [result.data]
        : [];
      const roomIds = rooms.map((r) => r.id);

      this.logger.log(`Returning ${roomIds.length} room IDs`);

      return {
        success: true,
        data: roomIds,
        count: roomIds.length,
      };
    } catch (error) {
      this.logger.error(`Get room IDs error: ${(error as Error).message}`);
      throw handleErrorFromMicroservices(
        error,
        'Failed to get room IDs',
        'RoomsController.getRoomIds'
      );
    }
  }

  @MessagePattern('UserService.Room.GetRoomsByIds')
  async getRoomByRoomIds(@Payload() data: { ids: string[] }) {
    try {
      this.logger.log(`Using pattern: UserService.Room.GetRoomsByIds`);
      const result = await this.roomsService.getRoomByRoomIds(data.ids);
      this.logger.log(`Found ${result.length} rooms`);
      return result;
    } catch (error) {
      this.logger.error(`Get rooms by IDs error: ${(error as Error).message}`);
      throw handleErrorFromMicroservices(
        error,
        'Failed to get room IDs',
        'RoomsController.getRoomIds'
      );
    }
  }
}
