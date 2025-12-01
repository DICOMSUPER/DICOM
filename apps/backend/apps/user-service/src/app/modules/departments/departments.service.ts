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
        where: { 
          departmentCode: createDepartmentDto.departmentCode,
          isDeleted: false,
        },
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
    departmentCode?: string[];
    includeInactive?: boolean;
    includeDeleted?: boolean;
    sortField?: string;
    order?: 'asc' | 'desc';
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.headDepartment', 'headDepartment')
      .leftJoinAndSelect('department.rooms', 'rooms');

    if (query.sortField && query.order) {
      qb.orderBy(`department.${query.sortField}`, query.order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy('department.createdAt', 'DESC');
    }

    qb.skip(skip).take(limit);

    if (!query.includeDeleted) {
      qb.where('department.isDeleted = :isDeleted', { isDeleted: false });
    }

    if (query.search) {
      qb.andWhere(
        '(department.departmentName ILIKE :search OR department.departmentCode ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.isActive !== undefined && !query.includeInactive) {
      qb.andWhere('department.isActive = :isActive', { isActive: query.isActive });
    } else if (!query.includeInactive) {
      qb.andWhere('department.isActive = :isActive', { isActive: true });
    }

    if (query.departmentCode && query.departmentCode.length > 0) {
      qb.andWhere('department.departmentCode IN (:...departmentCode)', { departmentCode: query.departmentCode });
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

  async findAllWithoutPagination(query?: {
    search?: string;
    isActive?: boolean;
    departmentCode?: string[];
    includeInactive?: boolean;
    includeDeleted?: boolean;
  }): Promise<Department[]> {
    const qb = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.headDepartment', 'headDepartment')
      .leftJoinAndSelect('department.rooms', 'rooms')
      .orderBy('department.createdAt', 'DESC');

    if (!query?.includeDeleted) {
      qb.where('department.isDeleted = :isDeleted', { isDeleted: false });
    }

    if (query?.search) {
      qb.andWhere(
        '(department.departmentName ILIKE :search OR department.departmentCode ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query?.isActive !== undefined && !query.includeInactive) {
      qb.andWhere('department.isActive = :isActive', { isActive: query.isActive });
    } else if (!query?.includeInactive) {
      qb.andWhere('department.isActive = :isActive', { isActive: true });
    }

    if (query?.departmentCode && query.departmentCode.length > 0) {
      qb.andWhere('department.departmentCode IN (:...departmentCode)', { departmentCode: query.departmentCode });
    }

    return await qb.getMany();
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
          where: { 
            departmentCode: updateDepartmentDto.departmentCode,
            isDeleted: false,
          },
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

  async getStats(): Promise<{
    totalDepartments: number;
    activeDepartments: number;
    inactiveDepartments: number;
    totalRooms: number;
  }> {
    try {
      const [totalDepartments, activeDepartments, inactiveDepartments] = await Promise.all([
        this.departmentRepository.count({ where: { isDeleted: false } }),
        this.departmentRepository.count({ where: { isActive: true, isDeleted: false } }),
        this.departmentRepository.count({ where: { isActive: false, isDeleted: false } }),
      ]);

      // Count total rooms across all departments
      const totalRoomsResult = await this.departmentRepository
        .createQueryBuilder('department')
        .leftJoin('department.rooms', 'room')
        .select('COUNT(DISTINCT room.id)', 'count')
        .where('department.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('room.isDeleted = :roomDeleted', { roomDeleted: false })
        .getRawOne();

      const totalRooms = parseInt(totalRoomsResult?.count || '0', 10);

      return {
        totalDepartments,
        activeDepartments,
        inactiveDepartments,
        totalRooms,
      };
    } catch (error: any) {
      throw new DepartmentUpdateFailedException('Lỗi khi lấy thống kê phòng ban');
    }
  }
}
