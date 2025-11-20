import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from '@backend/shared-domain';
import { UpdateDepartmentDto } from '@backend/shared-domain';
import {
  DepartmentAlreadyExistsException,
  DepartmentCreationFailedException,
  DepartmentDeletionFailedException,
  DepartmentNotFoundException,
  DepartmentUpdateFailedException,
} from '@backend/shared-exception';
import { handleErrorFromMicroservices } from '@backend/shared-utils';

@Controller()
export class DepartmentsController {
  private readonly logger = new Logger('DepartmentsController');

  constructor(private readonly service: DepartmentsService) {}

  @MessagePattern('department.check-health')
  checkHealth() {
    return {
      service: 'DepartmentService',
      status: 'running',
      time: new Date(),
    };
  }

  @MessagePattern('department.create')
  async create(@Payload() dto: CreateDepartmentDto) {
    try {
      this.logger.log(`Creating department ${dto.departmentCode}`);
      const department = await this.service.create(dto);
      return { department, message: 'Tạo phòng ban thành công' };
    } catch (error) {
      this.logger.error(`Create department error: ${(error as Error).message}`);
      if (
        error instanceof DepartmentAlreadyExistsException ||
        error instanceof DepartmentCreationFailedException
      )
        throw error;
      handleErrorFromMicroservices(
        error,
        'Failed to create department',
        'DepartmentsController.create'
      );
    }
  }

  @MessagePattern('department.get-all')
  async findAll(
    @Payload()
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      departmentCode?: string[];
    }
  ) {
    try {
      const result = await this.service.findAll(query || {});
      return result;
    } catch (error) {
      handleErrorFromMicroservices(
        error,
        'Failed to get departments',
        'DepartmentsController.findAll'
      );
    }
  }

  @MessagePattern('department.get-by-id')
  async findOne(@Payload() data: { id: string }) {
    try {
      const department = await this.service.findOne(data.id);
      return { department, message: 'Lấy phòng ban thành công' };
    } catch (error) {
      if (error instanceof DepartmentNotFoundException) throw error;
      handleErrorFromMicroservices(
        error,
        'Failed to get department',
        'DepartmentsController.findOne'
      );
    }
  }

  @MessagePattern('department.update')
  async update(
    @Payload() data: { id: string; updateDto: UpdateDepartmentDto }
  ) {
    try {
      const department = await this.service.update(data.id, data.updateDto);
      return { department, message: 'Cập nhật phòng ban thành công' };
    } catch (error) {
      if (
        error instanceof DepartmentNotFoundException ||
        error instanceof DepartmentAlreadyExistsException ||
        error instanceof DepartmentUpdateFailedException
      )
        throw error;
      handleErrorFromMicroservices(
        error,
        'Failed to update department',
        'DepartmentsController.update'
      );
    }
  }

  @MessagePattern('department.delete')
  async remove(@Payload() data: { id: string }) {
    try {
      await this.service.remove(data.id);
      return { message: 'Xóa phòng ban thành công' };
    } catch (error) {
      if (
        error instanceof DepartmentNotFoundException ||
        error instanceof DepartmentDeletionFailedException
      )
        throw error;
      handleErrorFromMicroservices(
        error,
        'Failed to delete department',
        'DepartmentsController.remove'
      );
    }
  }

  @MessagePattern('department.get-by-code')
  async findByCode(@Payload() data: { code: string }) {
    try {
      const department = await this.service.findByCode(data.code);
      return { department, message: 'Lấy thông tin phòng ban thành công' };
    } catch (error) {
      if (error instanceof DepartmentNotFoundException) throw error;
      handleErrorFromMicroservices(
        error,
        'Failed to get department by code',
        'DepartmentsController.findByCode'
      );
    }
  }

  @MessagePattern('department.get-active')
  async findActive() {
    try {
      const departments = await this.service.findActive();
      return { departments, count: departments.length };
    } catch (error) {
      handleErrorFromMicroservices(
        error,
        'Failed to get active departments',
        'DepartmentsController.findActive'
      );
    }
  }
}
