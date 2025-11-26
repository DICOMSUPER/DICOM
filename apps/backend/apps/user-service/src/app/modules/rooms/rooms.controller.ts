import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, Room } from '@backend/shared-domain';
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
import { Roles } from '@backend/shared-enums';

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
      status?: string;
      type?: string;
      departmentId?: string;
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

  @MessagePattern('room.get-all-without-pagination')
  async findAllWithoutPagination(
    @Payload()
    query?: {
      search?: string;
      isActive?: boolean;
      status?: string;
      type?: string;
      departmentId?: string;
    }
  ) {
    try {
      const result = await this.roomsService.findAllWithoutPagination(query);
      return { data: result };
    } catch (error) {
      this.logger.error(`Get all rooms without pagination error: ${(error as Error).message}`);
      handleErrorFromMicroservices(
        error,
        'Failed to get rooms',
        'RoomsController.findAllWithoutPagination'
      );
    }
  }

  @MessagePattern('room.get-stats')
  async getStats() {
    try {
      return await this.roomsService.getStats();
    } catch (error) {
      this.logger.error(`Get room stats error: ${(error as Error).message}`);
      handleErrorFromMicroservices(
        error,
        'Failed to get room stats',
        'RoomsController.getStats'
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
      role?: Roles;
    }
  ) {
    this.logger.log('Using pattern: UserService.Room.GetRoomByDepartmentId');
    try {
      return await this.roomsService.getRoomByDepartmentId(data);
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

      const roomsPayload = result?.data?.data;
      const rooms = Array.isArray(roomsPayload) ? roomsPayload : [];
      const roomIds = rooms
        .map((room: Room) => room.id)
        .filter((id): id is string => Boolean(id));

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

  @MessagePattern('UserService.Room.GetRoomsByDepartmentAndServiceId')
  async getRoomsByDepartmentAndServiceId(
    @Payload() data: { departmentId: string; serviceId: string; role?: Roles }
  ) {
    this.logger.log(
      'Using pattern: UserService.Room.GetRoomsByDepartmentAndServiceId'
    );
    try {
      const { departmentId, serviceId, role } = data;
      return await this.roomsService.getRoomsByDepartmentAndServiceId(
        departmentId,
        serviceId,
        role
      );
    } catch (error) {
      this.logger.error(
        `Get rooms by department and service error: ${(error as Error).message}`
      );
      throw handleErrorFromMicroservices(
        error,
        'Failed to get room by department and service',
        'UserService'
      );
    }
  }
  // get room by department id room.get-by-department-id
  @MessagePattern('room.get-by-department-id')
  async getRoomsByDepartmentId(@Payload() data: { departmentId: string }) {
    this.logger.log(
      'Using pattern: UserService.Room.GetRoomsByDepartmentAndServiceId'
    );
    try {
      const { departmentId } = data;
      const rooms = await this.roomsService.getRoomByDepartmentIdV2(
        departmentId
      );

      return {
        success: true,
        data: rooms,
        message: 'Lấy danh sách phòng theo khoa thành công',
      };
    } catch (error) {
      this.logger.error(
        `Get rooms by department and service error: ${(error as Error).message}`
      );
      throw handleErrorFromMicroservices(
        error,
        'Failed to get room by department and service',
        'UserService'
      );
    }
  }
}
