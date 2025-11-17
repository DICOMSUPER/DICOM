import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '@backend/shared-domain';
import { CreateDepartmentDto } from '@backend/shared-domain';
import { UpdateDepartmentDto } from '@backend/shared-domain';
import { PaginatedResponseDto } from '@backend/database';
import {
  DepartmentAlreadyExistsException,
  DepartmentCreationFailedException,
  DepartmentDeletionFailedException,
  DepartmentNotFoundException,
  DepartmentUpdateFailedException,
} from '@backend/shared-exception';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) { }

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { departmentCode: createDepartmentDto.departmentCode },
      });

      if (existingDepartment) {
        throw new DepartmentAlreadyExistsException(
          `Department with code ${createDepartmentDto.departmentCode} already exists`,
        );
      }

      const department = this.departmentRepository.create(createDepartmentDto);
      return await this.departmentRepository.save(department);
    } catch (error: any) {
      if (error instanceof DepartmentAlreadyExistsException) throw error;
      throw new DepartmentCreationFailedException(error.message);
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.headDepartment', 'headDepartment')
      .leftJoinAndSelect('department.rooms', 'rooms')
      .orderBy('department.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere(
        '(department.departmentName ILIKE :search OR department.departmentCode ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.isActive !== undefined) {
      qb.andWhere('department.isActive = :isActive', { isActive: query.isActive });
    }

    const [data, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    return new PaginatedResponseDto(
      data,
      total,
      page,
      limit,
      totalPages,
      page < totalPages,
      page > 1
    );
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['headDepartment', 'users'],
    });

    if (!department) {
      throw new DepartmentNotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    try {
      const department = await this.findOne(id);

      if (
        updateDepartmentDto.departmentCode &&
        updateDepartmentDto.departmentCode !== department.departmentCode
      ) {
        const existingDepartment = await this.departmentRepository.findOne({
          where: { departmentCode: updateDepartmentDto.departmentCode },
        });

        if (existingDepartment) {
          throw new DepartmentAlreadyExistsException(
            `Department with code ${updateDepartmentDto.departmentCode} already exists`,
          );
        }
      }

      Object.assign(department, updateDepartmentDto);
      return await this.departmentRepository.save(department);
    } catch (error: any) {
      if (
        error instanceof DepartmentNotFoundException ||
        error instanceof DepartmentAlreadyExistsException
      )
        throw error;
      throw new DepartmentUpdateFailedException(error.message);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const department = await this.findOne(id);
      await this.departmentRepository.remove(department);
    } catch (error: any) {
      if (error instanceof DepartmentNotFoundException) throw error;
      throw new DepartmentDeletionFailedException(error.message);
    }
  }

  async findByCode(departmentCode: string): Promise<Department | null> {
    const department = await this.departmentRepository.findOne({
      where: { departmentCode },
      relations: ['headDepartment', 'users'],
    });

    if (!department) {
      throw new DepartmentNotFoundException(
        `Department with code ${departmentCode} not found`,
      );
    }

    return department;
  }

  async findActive(): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: { isActive: true },
      relations: ['headDepartment'],
      order: { departmentName: 'ASC' },
    });
  }
}
