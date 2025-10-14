import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Inject, 
  Logger, 
  UseInterceptors, 
  Delete, 
  Put 
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';
import { TransformInterceptor, RequestLoggingInterceptor } from '@backend/shared-interceptor';
import { Roles } from '@backend/shared-enums';
import { Role1s, Public } from '@backend/auth-guards';

class CreateDepartmentDto {
  departmentCode!: string;
  departmentName!: string;
  description?: string;
  isActive?: boolean;
}

class UpdateDepartmentDto {
  departmentName?: string;
  description?: string;
  isActive?: boolean;
}

@ApiTags('Department Management')
@Controller('departments')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DepartmentsController {
  private readonly logger = new Logger('DepartmentsController');

  constructor(
    @Inject('USER_SERVICE') private readonly departmentClient: ClientProxy,
  ) {}

  // 🩺 Kiểm tra tình trạng service
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Check Department service health' })
  async checkHealth() {
    try {
      const result = await firstValueFrom(
        this.departmentClient.send('department.check-health', {})
      );
      return { ...result, message: 'Department service đang hoạt động' };
    } catch (error) {
      this.logger.error('❌ Department health check failed', error);
      throw handleError(error);
    }
  }

  // 🏢 Lấy toàn bộ danh sách phòng ban
  @Get()
  @Role1s(Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách phòng ban thành công' })
  async getAllDepartments() {
    try {
      this.logger.log('📋 Fetching all departments...');
      const result = await firstValueFrom(
        this.departmentClient.send('department.get-all', {})
      );
      this.logger.log(`✅ Retrieved ${result.count || 0} departments`);
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch departments', error);
      throw handleError(error);
    }
  }

  // 🆕 Tạo phòng ban mới
  @Post()
  @Role1s(Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({ status: 201, description: 'Tạo phòng ban thành công' })
  async createDepartment(@Body() createDto: CreateDepartmentDto) {
    try {
      this.logger.log(`🏗️ Creating department: ${createDto.departmentCode}`);
      const result = await firstValueFrom(
        this.departmentClient.send('department.create', createDto)
      );
      return {
        department: result.department,
        message: result.message || 'Tạo phòng ban thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Department creation failed: ${createDto.departmentCode}`, error);
      throw handleError(error);
    }
  }

  // 🔍 Lấy chi tiết 1 phòng ban theo ID
  @Get(':id')
  @Role1s(Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin phòng ban thành công' })
  async getDepartmentById(@Param('id') id: string) {
    try {
      this.logger.log(`🔎 Fetching department by ID: ${id}`);
      const result = await firstValueFrom(
        this.departmentClient.send('department.get-by-id', { id })
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get department by ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // ✏️ Cập nhật thông tin phòng ban
  @Put(':id')
  @Role1s(Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Update department details' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({ status: 200, description: 'Cập nhật phòng ban thành công' })
  async updateDepartment(
    @Param('id') id: string, 
    @Body() updateDto: UpdateDepartmentDto
  ) {
    try {
      this.logger.log(`🛠️ Updating department ID: ${id}`);
      const result = await firstValueFrom(
        this.departmentClient.send('department.update', { id, updateDto })
      );
      return {
        department: result.department,
        message: result.message || 'Cập nhật phòng ban thành công',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to update department ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // 🗑️ Xóa phòng ban
  @Delete(':id')
  @Role1s(Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Xóa phòng ban thành công' })
  async deleteDepartment(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting department ID: ${id}`);
      const result = await firstValueFrom(
        this.departmentClient.send('department.delete', { id })
      );
      return { message: result.message || 'Xóa phòng ban thành công' };
    } catch (error) {
      this.logger.error(`❌ Failed to delete department ID: ${id}`, error);
      throw handleError(error);
    }
  }

  // 🔢 Lấy phòng ban theo mã code
  @Get('code/:code')
  @Role1s(Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get department by code' })
  @ApiParam({ name: 'code', description: 'Department Code' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin phòng ban thành công' })
  async getByCode(@Param('code') code: string) {
    try {
      this.logger.log(`🔎 Fetching department by code: ${code}`);
      const result = await firstValueFrom(
        this.departmentClient.send('department.get-by-code', { code })
      );
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get department by code: ${code}`, error);
      throw handleError(error);
    }
  }

  // 🟢 Lấy các phòng ban đang hoạt động
  @Get('active')
  @Role1s(Roles.RECEPTION_STAFF)
  @ApiOperation({ summary: 'Get active departments' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách phòng ban hoạt động thành công' })
  async getActiveDepartments() {
    try {
      this.logger.log('🟢 Fetching active departments...');
      const result = await firstValueFrom(
        this.departmentClient.send('department.get-active', {})
      );
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch active departments', error);
      throw handleError(error);
    }
  }
}
