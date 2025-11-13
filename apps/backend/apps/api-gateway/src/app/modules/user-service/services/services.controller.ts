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

@Controller('services')
@UseInterceptors(RequestLoggingInterceptor, TransformInterceptor)
export class ServicesController {
  constructor(
    @Inject(process.env.USER_SERVICE_NAME || 'USER_SERVICE')
    private readonly userService: ClientProxy
  ) {}

  @Get()
  async getServices() {
    return await firstValueFrom(
      this.userService.send('UserService.Services.FindAll', {})
    );
  }

  @Get('paginated')
  async findMany(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchField') searchField?: string,
    @Query('sortField') sortField?: string,
    @Query('order') order?: 'asc' | 'desc'
  ) {
    const paginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchField,
      sortField,
      order,
    };
    return await firstValueFrom(
      this.userService.send('UserService.Services.FindMany', {
        paginationDto,
      })
    );
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
  async deleteService(@Param('id') id: string) {
    return await firstValueFrom(
      this.userService.send('UserService.Services.Delete', {
        id,
      })
    );
  }
}
