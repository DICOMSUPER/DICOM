import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
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
  ) {}

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
    } catch (error : any) {
      if (error instanceof DepartmentAlreadyExistsException) throw error;
      throw new DepartmentCreationFailedException(error.message);
    }
  }

  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      relations: ['headDepartment', 'users'],
      order: { createdAt: 'DESC' },
    });
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
    } catch (error : any) {
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
    } catch (error :any) {
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
