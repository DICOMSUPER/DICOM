import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { RoomRepository } from '@backend/shared-domain';
import { CreateRoomDto, UpdateRoomDto, RoomSearchFilters } from '@backend/shared-domain';
import { Room, RoomType } from '@backend/shared-domain';
import { RepositoryPaginationDto, PaginatedResponseDto } from '@backend/database';

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  async create(createDto: CreateRoomDto): Promise<Room> {
    try {
      // Check if room code already exists
      const existingRoom = await this.roomRepository.findByCode(createDto.room_code);
      if (existingRoom) {
        throw new BadRequestException('Room code already exists');
      }

      const room = this.roomRepository.create(createDto);
      return await this.roomRepository.save(room);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create room');
    }
  }

  async findMany(paginationDto: RepositoryPaginationDto): Promise<PaginatedResponseDto<Room>> {
    try {
      const result = await this.roomRepository.findWithPagination(paginationDto);
      return {
        data: result.rooms,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPreviousPage: result.page > 1
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch rooms');
    }
  }

  async findOne(id: string): Promise<Room> {
    try {
      const room = await this.roomRepository.findOne({
        where: { room_id: id }
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      return room;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch room');
    }
  }

  async update(id: string, updateDto: UpdateRoomDto): Promise<Room> {
    try {
      const room = await this.findOne(id);
      
      // Check if new room code conflicts with existing rooms
      if (updateDto.room_code && updateDto.room_code !== room.room_code) {
        const existingRoom = await this.roomRepository.findByCode(updateDto.room_code);
        if (existingRoom) {
          throw new BadRequestException('Room code already exists');
        }
      }
      
      Object.assign(room, updateDto);
      return await this.roomRepository.save(room);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update room');
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const room = await this.findOne(id);
      await this.roomRepository.remove(room);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete room');
    }
  }

  async findByType(roomType: RoomType): Promise<Room[]> {
    try {
      return await this.roomRepository.findByType(roomType);
    } catch (error) {
      throw new BadRequestException('Failed to fetch rooms by type');
    }
  }

  async findActiveRooms(): Promise<Room[]> {
    try {
      return await this.roomRepository.findActiveRooms();
    } catch (error) {
      throw new BadRequestException('Failed to fetch active rooms');
    }
  }

  async findByCode(roomCode: string): Promise<Room | null> {
    try {
      return await this.roomRepository.findByCode(roomCode);
    } catch (error) {
      throw new BadRequestException('Failed to fetch room by code');
    }
  }

  async findWithFilters(filters: RoomSearchFilters): Promise<Room[]> {
    try {
      return await this.roomRepository.findWithFilters(filters);
    } catch (error) {
      throw new BadRequestException('Failed to fetch rooms with filters');
    }
  }

  async getStats(): Promise<any> {
    try {
      return await this.roomRepository.getRoomStats();
    } catch (error) {
      throw new BadRequestException('Failed to fetch room statistics');
    }
  }
}
