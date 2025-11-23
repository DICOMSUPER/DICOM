import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  CreateServiceRoomDto,
  FilterServiceRoomDto,
  Room,
  ServiceRoom,
  Services,
  UpdateServiceRoomDto,
} from '@backend/shared-domain';
import { PaginatedResponseDto } from '@backend/database';

@Injectable()
export class ServiceRoomsService {
  constructor(
    @InjectRepository(ServiceRoom)
    private readonly serviceRoomRepository: Repository<ServiceRoom>,
    @InjectRepository(Services)
    private readonly servicesRepository: Repository<Services>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly entityManager: EntityManager
  ) {}

  async create(data: CreateServiceRoomDto) {
    return await this.entityManager.transaction(async (em) => {
      const service = await this.servicesRepository.findOne({
        where: { id: data.serviceId },
      });

      if (!service) {
        throw new NotFoundException(
          `Service with ID ${data.serviceId} not found`
        );
      }
      const room = await this.roomRepository.findOne({
        where: { id: data.roomId },
      });

      if (!room) {
        throw new NotFoundException(`Room with ID ${data.roomId} not found`);
      }
      const existingAssignment = await this.serviceRoomRepository.findOne({
        where: {
          serviceId: data.serviceId,
          roomId: data.roomId,
        },
      });

      if (existingAssignment) {
        throw new ConflictException(
          `Service ${service.serviceName} is already assigned to room ${room.roomCode}`
        );
      }
      const serviceRoom = this.serviceRoomRepository.create({
        ...data,
        serviceId: data.serviceId,
        roomId: data.roomId,
        isActive: true,
      });

      return await em.save(ServiceRoom, serviceRoom);
    });
  }

 async findAll(filter: FilterServiceRoomDto): Promise<PaginatedResponseDto<ServiceRoom>> {
  const { page = 1, limit = 10, roomCode, serviceName, isActive } = filter;

  const qb = this.serviceRoomRepository
    .createQueryBuilder('sr')
    .leftJoinAndSelect('sr.service', 'service')
    .leftJoinAndSelect('sr.room', 'room')
    .leftJoinAndSelect('room.department', 'department');

  if (serviceName) {
    qb.andWhere('service.serviceName ILIKE :serviceName', { 
      serviceName: `%${serviceName}%` 
    });
  }

if (roomCode) {
  qb.andWhere('room.roomCode ILIKE :roomCode', { 
    roomCode: `%${roomCode}%`
  });
}
  if (isActive !== undefined) {
    qb.andWhere('sr.isActive = :isActive', { isActive });
  }

  qb.orderBy('sr.createdAt', 'DESC');

  const skip = (page - 1) * limit;
  qb.skip(skip).take(limit);

  try {
    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return new PaginatedResponseDto(
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage
    );
  } catch (error) {
    console.error('❌ Database error:', error);
    throw new BadRequestException(
      `Error querying service rooms: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

async findAllWithoutPagination(filter: FilterServiceRoomDto): Promise<ServiceRoom[]> {
  const { roomId, roomCode, serviceName, serviceId, isActive } = filter;

  const qb = this.serviceRoomRepository
    .createQueryBuilder('sr')
    .leftJoinAndSelect('sr.service', 'service')
    .leftJoinAndSelect('sr.room', 'room')
    .leftJoinAndSelect('room.department', 'department');

  if (serviceId) {
    qb.andWhere('service.id = :serviceId', { 
      serviceId
    });
  }
  if (serviceName) {
    qb.andWhere('service.serviceName ILIKE :serviceName', { 
      serviceName: `%${serviceName}%` 
    });
  }
  if (roomId) {
    qb.andWhere('room.id = :roomId', { 
      roomId
    });
  }

  if (roomCode) {
    qb.andWhere('room.roomCode ILIKE :roomCode', { 
      roomCode: `%${roomCode}%`
    });
  }

  if (isActive !== undefined) {
    qb.andWhere('sr.isActive = :isActive', { isActive });
  }

  qb.orderBy('sr.createdAt', 'DESC');

  return await qb.getMany();
}


  async findOne(id: string) {
    const serviceRoom = await this.serviceRoomRepository.findOne({
      where: { id },
      relations: ['service', 'room', 'room.department'],
    });

    if (!serviceRoom) {
      throw new NotFoundException(`ServiceRoom with ID ${id} not found`);
    }

    return serviceRoom;
  }

  async findByService(serviceId: string) {
    return await this.serviceRoomRepository
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.service', 'service')
      .leftJoinAndSelect('sr.room', 'room')
      .leftJoinAndSelect('room.department', 'department')
      .where('service.id = :serviceId', { serviceId })
      .orderBy('sr.createdAt', 'DESC')
      .getMany();
  }

  async findByRoom(roomId: string) {
    return await this.serviceRoomRepository
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.service', 'service')
      .leftJoinAndSelect('sr.room', 'room')
      .leftJoinAndSelect('room.department', 'department')
      .where('room.id = :roomId', { roomId })
      .orderBy('sr.createdAt', 'DESC')
      .getMany();
  }

  async update(id: string, updatedData: UpdateServiceRoomDto) {
    const serviceRoom = await this.findOne(id);

    if (updatedData.isActive !== undefined) {
      serviceRoom.isActive = updatedData.isActive;
    }

    if (updatedData.notes !== undefined) {
      serviceRoom.notes = updatedData.notes;
    }

    return await this.serviceRoomRepository.save(serviceRoom);
  }

  async delete(id: string) {
    const serviceRoom = await this.findOne(id);
    await this.serviceRoomRepository.remove(serviceRoom);
    return { success: true, message: 'ServiceRoom deleted successfully' };
  }
}
