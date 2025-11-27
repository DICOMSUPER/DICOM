import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { firstValueFrom } from 'rxjs';
import {
  RequestLoggingInterceptor,
  TransformInterceptor,
} from '@backend/shared-interceptor';
import { CreateServiceDto, UpdateServiceDto } from '@backend/shared-domain';
import { Public } from '@backend/shared-decorators';
import { handleError } from '@backend/shared-utils';
import { Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('services')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ServicesController {
  private readonly logger = new Logger(ServicesController.name);

  constructor(
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
  ) {}

  @Public()
  @Get()
  @Public()
  async getServices() {
    return await firstValueFrom(
      this.userService.send('UserService.Services.FindAll', {})
    );
  }

  @Get('paginated')
  @Public()
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('includeInactive') includeInactive?: boolean,
    @Query('includeDeleted') includeDeleted?: boolean
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
      includeInactive: includeInactive === true,
      includeDeleted: includeDeleted === true,
    };
    return await firstValueFrom(
      this.userService.send('UserService.Services.FindMany', {
        paginationDto,
      })
    );
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Get service statistics' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê dịch vụ thành công' })
  async getStats() {
    try {
      this.logger.log('Fetching service statistics');
      const result = await firstValueFrom(
        this.userService.send('UserService.Services.GetStats', {})
      );
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to fetch service stats', error);
      throw handleError(error);
    }
  }

  @Get(':id/department')
  async getAllServiceProvidedByADepartment(@Param('id') id: string) {
    return await firstValueFrom(
      this.userService.send('UserService.Services.GetByDepartmentId', {
        departmentId: id,
      })
    );
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    return await firstValueFrom(
      this.userService.send('UserService.Services.FindOne', {
        id,
      })
    );
  }

  @Post()
  @Public()
  async createService(@Body() createServiceDto: CreateServiceDto) {
    return await firstValueFrom(
      this.userService.send('UserService.Services.Create', createServiceDto)
    );
  }

  @Patch(':id')
  @Public()
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto
  ) {
    return await firstValueFrom(
      this.userService.send('UserService.Services.Update', {
        id,
        updateServiceDto,
      })
    );
  }

  @Delete(':id')
  @Public()
  async deleteService(@Param('id') id: string) {
    try {
      this.logger.log(`🗑️ Deleting service: ${id}`);
      const result = await firstValueFrom(
        this.userService.send('UserService.Services.Delete', {
          id,
        })
      );
      this.logger.log(`✅ Service deleted successfully: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to delete service: ${id}`, error);
      throw handleError(error);
    }
  }
}
