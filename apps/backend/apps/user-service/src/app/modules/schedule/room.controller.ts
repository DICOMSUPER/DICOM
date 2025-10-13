import { Controller, Get, Post, Body, Patch, Param, Delete, MessagePattern, Payload } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto, RoomSearchFilters } from '@backend/shared-domain';
import { RoomType } from '@backend/shared-domain';
import { RepositoryPaginationDto } from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @MessagePattern('UserService.Room.Create')
  async create(@Payload() createDto: CreateRoomDto) {
    try {
      return await this.roomService.create(createDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to create room', 'RoomController');
    }
  }

  @Get()
  @MessagePattern('UserService.Room.FindMany')
  async findMany(@Payload() data: { paginationDto: RepositoryPaginationDto }) {
    try {
      return await this.roomService.findMany(data.paginationDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch rooms', 'RoomController');
    }
  }

  @Get(':id')
  @MessagePattern('UserService.Room.FindOne')
  async findOne(@Payload() data: { id: string }) {
    try {
      return await this.roomService.findOne(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch room', 'RoomController');
    }
  }

  @Patch(':id')
  @MessagePattern('UserService.Room.Update')
  async update(@Payload() data: { id: string; updateDto: UpdateRoomDto }) {
    try {
      return await this.roomService.update(data.id, data.updateDto);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to update room', 'RoomController');
    }
  }

  @Delete(':id')
  @MessagePattern('UserService.Room.Delete')
  async remove(@Payload() data: { id: string }) {
    try {
      return await this.roomService.remove(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to delete room', 'RoomController');
    }
  }

  @Get('type/:roomType')
  @MessagePattern('UserService.Room.FindByType')
  async findByType(@Payload() data: { roomType: RoomType }) {
    try {
      return await this.roomService.findByType(data.roomType);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch rooms by type', 'RoomController');
    }
  }

  @Get('active')
  @MessagePattern('UserService.Room.FindActive')
  async findActive() {
    try {
      return await this.roomService.findActiveRooms();
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch active rooms', 'RoomController');
    }
  }

  @Get('code/:roomCode')
  @MessagePattern('UserService.Room.FindByCode')
  async findByCode(@Payload() data: { roomCode: string }) {
    try {
      return await this.roomService.findByCode(data.roomCode);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch room by code', 'RoomController');
    }
  }

  @Get('filters')
  @MessagePattern('UserService.Room.FindWithFilters')
  async findWithFilters(@Payload() data: { filters: RoomSearchFilters }) {
    try {
      return await this.roomService.findWithFilters(data.filters);
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch rooms with filters', 'RoomController');
    }
  }

  @Get('stats')
  @MessagePattern('UserService.Room.GetStats')
  async getStats() {
    try {
      return await this.roomService.getStats();
    } catch (error) {
      throw handleErrorFromMicroservices(error, 'Failed to fetch room statistics', 'RoomController');
    }
  }
}
