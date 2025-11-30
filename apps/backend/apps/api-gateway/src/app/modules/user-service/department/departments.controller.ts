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
  Put, 
  Query,
  Req
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { handleError } from '@backend/shared-utils';
import { TransformInterceptor, RequestLoggingInterceptor } from '@backend/shared-interceptor';
import { Roles } from '@backend/shared-enums';
import { Public } from '@backend/shared-decorators';
import type { Request } from 'express';
import { Role } from '@backend/shared-decorators';
import { CreateDepartmentDto } from '@backend/shared-domain';
import { UpdateDepartmentDto } from '@backend/shared-domain';

@ApiTags('Department Management')
@Controller('departments')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class DepartmentsController {
  private readonly logger = new Logger('DepartmentsController');

  constructor(
    @Inject('USER_SERVICE') private readonly departmentClient: ClientProxy,
  ) {}

  // 🩺 Kiểm tra tình trạng service
  
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
 @Public()
  @Get()
  @ApiOperation({ summary: 'Get all departments with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or code' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive records' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Include deleted records' })
  @ApiQuery({ name: 'sortField', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách phòng ban thành công' })
  async getAllDepartments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('departmentCode') departmentCode?: string[],
    @Query('includeInactive') includeInactive?: boolean,
    @Query('includeDeleted') includeDeleted?: boolean,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    try {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 10;

      this.logger.log(`Fetching departments - Page: ${pageNum}, Limit: ${limitNum}`);
      
      const result = await firstValueFrom(
        this.departmentClient.send('department.get-all', {
          page: pageNum,
          limit: limitNum,
          search,
          isActive,
          departmentCode,
          includeInactive: includeInactive === true,
          includeDeleted: includeDeleted === true,
          sortField,
          order,
        })
      );

      this.logger.log(`Retrieved ${result?.data?.length || 0} departments (Total: ${result?.total || 0})`);
      
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch departments', error);
      throw handleError(error);
    }
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Get all departments without pagination (for analytics)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách phòng ban thành công' })
  async getAllDepartmentsWithoutPagination(
    @Query('isActive') isActive?: boolean,
  ) {
    try {
      this.logger.log('Fetching all departments without pagination for analytics');
      
      const result = await firstValueFrom(
        this.departmentClient.send('department.get-all-without-pagination', {
          isActive,
        })
      );

      return {
        data: result?.data || [],
        count: result?.data?.length || 0,
      };
    } catch (error) {
      this.logger.error('Failed to fetch all departments', error);
      throw handleError(error);
    }
  }
  
  

  // 🆕 Tạo phòng ban mới
  @Role(Roles.SYSTEM_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({ status: 201, description: 'Tạo phòng ban thành công' })
  async createDepartment(@Body() createDto: CreateDepartmentDto, @Req() req: Request)  {
    try {
      const token = req.cookies?.token; 
       this.logger.log("check token in create department: ", token);
      this.logger.log(`🏗️ Creating department: ${createDto.departmentCode}`);
      
      const result = await firstValueFrom(
        this.departmentClient.send('department.create', {...createDto, token})
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

  // 🟢 Lấy các phòng ban đang hoạt động
  @Role(Roles.SYSTEM_ADMIN)
  @Get('active')
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

  @Get('stats')
  @Role(Roles.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Get department statistics' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê phòng ban thành công' })
  async getStats() {
    try {
      this.logger.log('Fetching department statistics');
      const result = await firstValueFrom(
        this.departmentClient.send('department.get-stats', {})
      );
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch department stats', error);
      throw handleError(error);
    }
  }

  // 🔢 Lấy phòng ban theo mã code
  @Role(Roles.SYSTEM_ADMIN)
  @Get('code/:code')
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

  // 🔍 Lấy chi tiết 1 phòng ban theo ID
  @Role(Roles.SYSTEM_ADMIN)
  @Get(':id')
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
  @Role(Roles.SYSTEM_ADMIN)
  @Put(':id')
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
  @Role(Roles.SYSTEM_ADMIN)
  @Delete(':id')
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
}
