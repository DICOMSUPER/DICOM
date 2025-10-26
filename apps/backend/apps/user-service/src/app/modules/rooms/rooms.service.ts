import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto, RoomStatus } from '@backend/shared-domain';
import { UpdateRoomDto } from '@backend/shared-domain';
import { Room } from '@backend/shared-domain';
import {
  RoomNotFoundException,
  RoomAlreadyExistsException,
  RoomCreationFailedException,
  RoomUpdateFailedException,
  RoomDeletionFailedException,
  InvalidRoomDataException,
  DatabaseException,
} from '@backend/shared-exception';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { HttpStatus } from '@nestjs/common';
import { RedisService } from '@backend/redis';
import { RoomType } from '@backend/shared-enums';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly redisService: RedisService
  ) { }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    try {
      this.logger.log(
        `Creating room with data: ${JSON.stringify(createRoomDto)}`
      );

      if (!createRoomDto.roomCode) {
        throw new InvalidRoomDataException(
          'Mã phòng (roomCode) không được để trống'
        );
      }

      const existingRoom = await this.roomRepository.findOne({
        where: { roomCode: createRoomDto.roomCode },
      });
      if (existingRoom) {
        throw new RoomAlreadyExistsException(
          `Phòng với mã "${createRoomDto.roomCode}" đã tồn tại`
        );
      }

      const newRoom = this.roomRepository.create({
        ...createRoomDto,
        department: createRoomDto.department
          ? { id: createRoomDto.department }
          : undefined,
      });

      const savedRoom = await this.roomRepository.save(newRoom);

      this.logger.log(`✅ Room created successfully with ID: ${savedRoom.id}`);
      return savedRoom;
    } catch (error: unknown) {
      this.logger.error(`❌ Create room error: ${(error as Error).message}`);
      if (
        error instanceof RoomAlreadyExistsException ||
        error instanceof InvalidRoomDataException
      ) {
        throw error;
      }
      throw new RoomCreationFailedException('Không thể tạo phòng');
    }
  }

  async findOne(id: string): Promise<Room> {
    try {
      this.logger.log(`Finding room with ID: ${id}`);

      const room = await this.roomRepository.findOne({
        where: { id },
      });

      if (!room) {
        throw new RoomNotFoundException(`Không tìm thấy phòng với ID: ${id}`);
      }

      this.logger.log(`Room found: ${room.roomCode}`);
      return room;
    } catch (error: unknown) {
      this.logger.error(`Find room error: ${(error as Error).message}`);
      if (error instanceof RoomNotFoundException) throw error;
      throw new RoomNotFoundException('Không thể tìm thấy phòng');
    }
  }
  // async findAll(query: {
  //   page?: number;
  //   limit?: number;
  //   search?: string;
  //   isActive?: boolean;
  // }) {
  //   try {
  //     const page = query.page ?? 1;
  //     const limit = query.limit ?? 10;
  //     const skip = (page - 1) * limit;

  //     const qb = this.roomRepository
  //       .createQueryBuilder('room')
  //       .leftJoinAndSelect('room.department', 'department')
  //       .orderBy('room.createdAt', 'DESC')
  //       .skip(skip)
  //       .take(limit);

  //     if (query.search) {
  //       qb.andWhere(
  //         '(room.description ILIKE :search OR room.roomCode ILIKE :search)',
  //         {
  //           search: `%${query.search}%`,
  //         }
  //       );
  //     }

  //     if (query.isActive !== undefined) {
  //       qb.andWhere('room.isActive = :isActive', { isActive: query.isActive });
  //     }

  //     const [data, total] = await qb.getManyAndCount();

  //     return {
  //       data: {
  //         data,
  //         pagination: {
  //           page,
  //           limit,
  //           total,
  //           totalPages: Math.ceil(total / limit),
  //         },
  //         count: data.length,
  //       },
  //       message: 'Lấy danh sách phòng thành công',
  //     };
  //   } catch (error: any) {
  //     this.logger.error(`Find all rooms error: ${error.message}`);
  //     throw new DatabaseException('Lỗi khi lấy danh sách phòng');
  //   }
  // }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1) * limit;
      const search = query.search ?? '';
      const isActive = query.isActive;

      // 🔹 Tạo cache key duy nhất
      const cacheKey = `rooms:page=${page}:limit=${limit}:search=${search || 'none'}:active=${isActive ?? 'all'}`;

      // 🔹 Kiểm tra cache trước
      const cachedData = await this.redisService.get<any>(cacheKey);
      if (cachedData) {
        this.logger.log(`✅ [CACHE HIT] Dữ liệu lấy từ Redis key: ${cacheKey}`);
        return cachedData;
      }

      this.logger.log(`⚙️ [CACHE MISS] Lấy dữ liệu từ DB, key: ${cacheKey}`);

      // 🔹 Query DB
      const qb = this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.department', 'department')
        .orderBy('room.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (search) {
        qb.andWhere(
          '(room.description ILIKE :search OR room.roomCode ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (isActive !== undefined) {
        qb.andWhere('room.isActive = :isActive', { isActive });
      }

      const [data, total] = await qb.getManyAndCount();

      const response = {
        data: {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          count: data.length,
        },
        message: 'Lấy danh sách phòng thành công',
      };

      // 🔹 Lưu cache với TTL = 60 giây (tùy bạn chỉnh)
      await this.redisService.set(cacheKey, response, 60 * 1000);

      return response;
    } catch (error: any) {
      this.logger.error(`Find all rooms error: ${error.message}`);
      throw new DatabaseException('Lỗi khi lấy danh sách phòng');
    }
  }


  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    try {
      this.logger.log(
        `Updating room ID: ${id} with data: ${JSON.stringify(updateRoomDto)}`
      );

      const room = await this.findOne(id);

      // Check trùng mã phòng nếu cập nhật roomCode
      if (updateRoomDto.roomCode && updateRoomDto.roomCode !== room.roomCode) {
        const existingRoom = await this.roomRepository.findOne({
          where: { roomCode: updateRoomDto.roomCode },
        });
        if (existingRoom && existingRoom.id !== id) {
          throw new RoomAlreadyExistsException(
            `Phòng với mã "${updateRoomDto.roomCode}" đã tồn tại`
          );
        }
      }

      Object.assign(room, updateRoomDto);
      const updatedRoom = await this.roomRepository.save(room);

      this.logger.log(`✅ Room updated successfully: ${updatedRoom.id}`);
      return updatedRoom;
    } catch (error: unknown) {
      this.logger.error(`Update room error: ${(error as Error).message}`);
      if (
        error instanceof RoomNotFoundException ||
        error instanceof RoomAlreadyExistsException
      ) {
        throw error;
      }
      throw new RoomUpdateFailedException('Không thể cập nhật phòng');
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting room ID: ${id}`);

      const room = await this.findOne(id);
      await this.roomRepository.remove(room);

      this.logger.log(`✅ Room deleted successfully: ${id}`);
      return true;
    } catch (error: unknown) {
      this.logger.error(`Remove room error: ${(error as Error).message}`);
      if (error instanceof RoomNotFoundException) throw error;
      throw new RoomDeletionFailedException('Không thể xóa phòng');
    }
  }
  
  async getRoomByDepartmentId(
    id: string,
    applyScheduleFilter: boolean,
    search?: string
  ): Promise<Room[]> {
    try {
      const qb = this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.department', 'department')
        .leftJoinAndSelect('room.schedules', 'schedules') // Alias: schedules
        .where('room.department_id = :id', { id }) // Base where for department
        .andWhere('room.status IN (:...status)', {
          status: [RoomStatus.AVAILABLE, RoomStatus.OCCUPIED],
        });

      // Combine date and time activity filters
      if (applyScheduleFilter) {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0]; // 'HH:MM:SS'
        qb.andWhere(
          `(schedules.work_date = :currentDate
          AND (
            (schedules.actual_start_time > schedules.actual_end_time 
              AND (schedules.actual_start_time < :currentTime OR schedules.actual_end_time > :currentTime)
            ) 
            OR 
            (schedules.actual_start_time <= schedules.actual_end_time 
              AND schedules.actual_start_time < :currentTime 
              AND schedules.actual_end_time > :currentTime
            )
          )
         )
         OR 
         (schedules.work_date = :yesterdayDate
          AND schedules.actual_start_time > schedules.actual_end_time
          AND :currentTime < schedules.actual_end_time
         )`,
          { currentDate, yesterdayDate, currentTime }
        );
      }

      // Optional: Filter by active statuses only (adjust based on your enum)
      // qb.andWhere('schedules.schedule_status IN (:...statuses)', { statuses: ['completed', 'scheduled', 'confirmed'] });

      if (search) {
        qb.andWhere(
          '(room.description ILIKE :search OR room.roomCode ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      const rooms = await qb.getMany();

      return rooms;
    } catch (error) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to get rooms by department_id: ${(error as Error).message || error
        }`,
        'UserService'
      );
    }
  }
  async filterRooms(query: {
  status?: RoomStatus;
  roomType?: RoomType;
  departmentId?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const { status, roomType, departmentId } = query;

    // 🔹 Tạo cache key để giảm tải DB
    const cacheKey = `rooms:filter:status=${status ?? 'all'}:type=${roomType ?? 'all'}:dept=${departmentId ?? 'all'}:page=${page}:limit=${limit}`;

    const cachedData = await this.redisService.get<any>(cacheKey);
    if (cachedData) {
      this.logger.log(`✅ [CACHE HIT] Dữ liệu filter lấy từ Redis key: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`⚙️ [CACHE MISS] Lấy dữ liệu filter từ DB key: ${cacheKey}`);

    const qb = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.department', 'department')
      .orderBy('room.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      qb.andWhere('room.status = :status', { status });
    }

    if (roomType) {
      qb.andWhere('room.roomType = :roomType', { roomType });
    }

    if (departmentId) {
      qb.andWhere('room.departmentId = :departmentId', { departmentId });
    }

    const [data, total] = await qb.getManyAndCount();

    const response = {
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        count: data.length,
      },
      message: 'Lọc danh sách phòng thành công',
    };

    // 🔹 Lưu cache 60 giây
    await this.redisService.set(cacheKey, response, 60 * 1000);

    return response;
  } catch (error: any) {
    this.logger.error(`Filter rooms error: ${error.message}`);
    throw new DatabaseException('Lỗi khi lọc danh sách phòng');
  }
}

}
