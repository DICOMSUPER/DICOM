import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateEmployeeRoomAssignmentDto,
  EmployeeRoomAssignment,
} from '@backend/shared-domain';

@Injectable()
export class EmployeeRoomAssignmentsService {
  constructor(
    @InjectRepository(EmployeeRoomAssignment)
    private readonly employeeRoomAssignmentRepository: Repository<EmployeeRoomAssignment>
  ) {}

  async create(data: CreateEmployeeRoomAssignmentDto) {
    const assignment = this.employeeRoomAssignmentRepository.create({
       ...data,
      isActive: data.isActive ?? true,
    });
    return await this.employeeRoomAssignmentRepository.save(assignment);
  }

  async findAll(filter?: {
    employeeId?: string;
    roomId?: string;
    serviceId?: string;
    isActive?: boolean;
  }) {
    const qb = this.employeeRoomAssignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.employee', 'employee')
      .leftJoinAndSelect('assignment.room', 'room')
      .leftJoinAndSelect('assignment.service', 'service');

    if (filter?.employeeId) {
      qb.andWhere('employee.id = :employeeId', {
        employeeId: filter.employeeId,
      });
    }

    if (filter?.roomId) {
      qb.andWhere('room.id = :roomId', { roomId: filter.roomId });
    }

    if (filter?.serviceId) {
      qb.andWhere('service.id = :serviceId', { serviceId: filter.serviceId });
    }

    if (filter?.isActive !== undefined) {
      qb.andWhere('assignment.isActive = :isActive', {
        isActive: filter.isActive,
      });
    }

    return await qb.getMany();
  }

  async findOne(id: string) {
    const assignment = await this.employeeRoomAssignmentRepository.findOne({
      where: { id },
      relations: ['employee', 'room', 'service'],
    });

    if (!assignment) {
      throw new NotFoundException(
        `EmployeeRoomAssignment with ID ${id} not found`
      );
    }

    return assignment;
  }

  async findByEmployee(employeeId: string) {
    return await this.employeeRoomAssignmentRepository.find({
      where: { employee: { id: employeeId } as any },
      relations: ['employee', 'room', 'service'],
    });
  }

  async update(id: string, data: { isActive?: boolean }) {
    const assignment = await this.findOne(id);

    if (data.isActive !== undefined) {
      assignment.isActive = data.isActive;
    }

    return await this.employeeRoomAssignmentRepository.save(assignment);
  }

  async delete(id: string) {
    const assignment = await this.findOne(id);
    await this.employeeRoomAssignmentRepository.remove(assignment);
    return {
      success: true,
      message: 'EmployeeRoomAssignment deleted successfully',
    };
  }
}
