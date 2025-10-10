import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RepositoryPaginationDto } from '@backend/database';
import { Room, RoomType } from '../entities/rooms/rooms.entity';
import { RoomSearchFilters } from '../dto/rooms/room.dto';

@Injectable()
export class RoomRepository extends BaseRepository<Room> {
  constructor(entityManager: EntityManager) {
    super(Room, entityManager);
  }

  async findByType(roomType: RoomType): Promise<Room[]> {
    return await this.findAll(
      { 
        where: { room_type: roomType, is_active: true },
        order: { room_code: 'ASC' }
      }
    );
  }

  async findActiveRooms(): Promise<Room[]> {
    return await this.findAll(
      { 
        where: { is_active: true },
        order: { room_code: 'ASC' }
      }
    );
  }

  async findByCode(roomCode: string): Promise<Room | null> {
    return await this.findOne({ where: { room_code: roomCode } });
  }

  async findWithFilters(filters: RoomSearchFilters = {}): Promise<Room[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('room');

    if (filters.room_code) {
      queryBuilder.andWhere('room.room_code ILIKE :roomCode', {
        roomCode: `%${filters.room_code}%`
      });
    }

    if (filters.room_type) {
      queryBuilder.andWhere('room.room_type = :roomType', {
        roomType: filters.room_type
      });
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('room.is_active = :isActive', {
        isActive: filters.is_active
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('room.room_code', 'ASC');

    return await queryBuilder.getMany();
  }

  async findWithPagination(paginationDto: RepositoryPaginationDto): Promise<{
    rooms: Room[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const result = await this.paginate(paginationDto, {}, this.entityManager);
    
    return {
      rooms: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  async getRoomStats(): Promise<{
    totalRooms: number;
    roomsByType: Record<string, number>;
    activeRooms: number;
  }> {
    const totalRooms = await this.getRepository().count();

    const roomsByType = await this.getRepository()
      .createQueryBuilder('room')
      .select('room.room_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('room.room_type')
      .getRawMany();

    const typeCounts = roomsByType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    const activeRooms = await this.getRepository()
      .count({ where: { is_active: true } });

    return {
      totalRooms,
      roomsByType: typeCounts,
      activeRooms
    };
  }
}
