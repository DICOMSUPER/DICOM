import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomAssignmentDto, UpdateRoomAssignmentDto, QueryRoomAssignmentDto, Room } from '@backend/shared-domain';
import { User } from '../users/entities/user.entity';

import { RoomAssignment } from './entities/room-assignments.entity';

@Injectable()
export class RoomAssignmentsService {
  constructor(
    @InjectRepository(RoomAssignment)
    private readonly roomAssignmentsRepository: Repository<RoomAssignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(createRoomAssignmentDto: CreateRoomAssignmentDto) {

    const user = await this.userRepository.findOne({ where: { id: createRoomAssignmentDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createRoomAssignmentDto.userId} not found`);
    }

    // const room = await this.roomRepository.findOne({ where: { id: createRoomAssignmentDto.roomId } });
    // if (!room) {
    //   throw new NotFoundException(`Room with ID ${createRoomAssignmentDto.roomId} not found`);
    // }

    if (createRoomAssignmentDto.startTime && createRoomAssignmentDto.endTime) {
      if (createRoomAssignmentDto.startTime >= createRoomAssignmentDto.endTime) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    const roomAssignment = this.roomAssignmentsRepository.create(createRoomAssignmentDto);
    return this.roomAssignmentsRepository.save(roomAssignment);
  }

  // get room assignments by user id
  async findByUserId(userId: string): Promise<RoomAssignment[]> {
    // check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return this.roomAssignmentsRepository.find({
      where: { userId, isActive: true },
      relations: ['room'],
      
    });
  }

  async findAll(queryDto: QueryRoomAssignmentDto): Promise<{ data: RoomAssignment[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, userId, roomId, assignmentType, dateFrom, dateTo } = queryDto;

    const queryBuilder = this.roomAssignmentsRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.user', 'user')
      .leftJoinAndSelect('assignment.room', 'room')
      .where('assignment.isActive = :isActive', { isActive: true });


    if (userId) {
      queryBuilder.andWhere('assignment.userId = :userId', { userId });
    }

    if (roomId) {
      queryBuilder.andWhere('assignment.roomId = :roomId', { roomId });
    }

    if (assignmentType) {
      queryBuilder.andWhere('assignment.assignmentType = :assignmentType', { assignmentType });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere('assignment.assignmentDate BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
    } else if (dateFrom) {
      queryBuilder.andWhere('assignment.assignmentDate >= :dateFrom', { dateFrom });
    } else if (dateTo) {
      queryBuilder.andWhere('assignment.assignmentDate <= :dateTo', { dateTo });
    }

 
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    
    queryBuilder.orderBy('assignment.assignmentDate', 'DESC');
    queryBuilder.addOrderBy('assignment.startTime', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<RoomAssignment> {
    const assignment = await this.roomAssignmentsRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'room'],
    });

    if (!assignment) {
      throw new NotFoundException(`Room assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async update(id: string, updateRoomAssignmentDto: UpdateRoomAssignmentDto): Promise<RoomAssignment> {
    
    const existingAssignment = await this.findOne(id);

  
    if (updateRoomAssignmentDto.userId) {
      const user = await this.userRepository.findOne({ where: { id: updateRoomAssignmentDto.userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${updateRoomAssignmentDto.userId} not found`);
      }
    }


    if (updateRoomAssignmentDto.roomId) {
      const room = await this.roomRepository.findOne({ where: { id: updateRoomAssignmentDto.roomId } });
      if (!room) {
        throw new NotFoundException(`Room with ID ${updateRoomAssignmentDto.roomId} not found`);
      }
    }

    const startTime = updateRoomAssignmentDto.startTime ?? existingAssignment.startTime;
    const endTime = updateRoomAssignmentDto.endTime ?? existingAssignment.endTime;

    if (startTime && endTime && startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    await this.roomAssignmentsRepository.update(id, updateRoomAssignmentDto);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
  
    await this.findOne(id); 

    await this.roomAssignmentsRepository.update(id, { isActive: false });
  }

  async hardRemove(id: string): Promise<void> {
   
    const result = await this.roomAssignmentsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Room assignment with ID ${id} not found`);
    }
  }
}
