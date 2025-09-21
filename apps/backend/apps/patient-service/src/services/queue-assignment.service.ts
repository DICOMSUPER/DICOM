import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { QueueAssignment } from '../entities/queue-assignment.entity';
import { CreateQueueAssignmentDto, UpdateQueueAssignmentDto } from '../dtos/queue.dto';

@Injectable()
export class QueueAssignmentService {
  constructor(
    @InjectRepository(QueueAssignment)
    private queueRepository: Repository<QueueAssignment>,
  ) {}

  async create(dto: CreateQueueAssignmentDto): Promise<QueueAssignment> {
    const queue = this.queueRepository.create({
      ...dto,
      queueId: uuidv4(),
    });
    return await this.queueRepository.save(queue);
  }

  async findAll(encounterId?: string): Promise<QueueAssignment[]> {
    if (encounterId) {
      return await this.queueRepository.find({ where: { encounterId, isDeleted: false }, relations: ['encounter'] });
    }
    return await this.queueRepository.find({ where: { isDeleted: false }, relations: ['encounter'] });
  }

  async findOne(id: string): Promise<QueueAssignment> {
    const item = await this.queueRepository.findOne({ where: { queueId: id, isDeleted: false }, relations: ['encounter'] });
    if (!item) {
      throw new NotFoundException(`Queue assignment with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, dto: UpdateQueueAssignmentDto): Promise<QueueAssignment> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return await this.queueRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    item.isDeleted = true;
    await this.queueRepository.save(item);
  }
}


