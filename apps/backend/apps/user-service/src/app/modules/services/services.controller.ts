import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  BodyPart,
  CreateServiceDto,
  Services,
  UpdateBodyPartDto,
  UpdateServiceDto,
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';
import { ServicesService } from './services.service';

@Controller()
export class ServicesController {
  private logger = new Logger('UserService');
  constructor(private readonly servicesService: ServicesService) {}

  @MessagePattern(`UserService.Services.Create`)
  async create(
    @Payload() createServiceDto: CreateServiceDto
  ): Promise<Services> {
    this.logger.log(`Using pattern: UserService.Services.Create`);
    try {
      return await this.servicesService.create(createServiceDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create service',
        'UserService'
      );
    }
  }

  @MessagePattern(`UserService.Services.FindAll`)
  async findAll(
    
  ): Promise<Services[]> {
    this.logger.log(`Using pattern: UserService.Services.FindAll`);
    try {
      return await this.servicesService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all services',
        'UserService'
      );
    }
  }

  @MessagePattern(`UserService.Services.FindOne`)
  async findOne(@Payload() data: { id: string }): Promise<Services | null> {
    this.logger.log(`Using pattern: UserService.Services.FindOne`);
    try {
      const { id } = data;
      return await this.servicesService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find service with id: ${data.id}`,
        'UserService'
      );
    }
  }

  @MessagePattern(`UserService.Services.Update`)
  async update(
    @Payload()
    data: {
      id: string;
      updateServiceDto: UpdateServiceDto;
    }
  ): Promise<Services | null> {
    this.logger.log(`Using pattern: UserService.Services.Update`);
    try {
      const { id, updateServiceDto } = data;
      return await this.servicesService.update(id, updateServiceDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update for service with this id: ${data.id}`,
        'UserService'
      );
    }
  }

  @MessagePattern(`UserService.Services.Delete`)
  async remove(@Payload() data: { id: string }): Promise<boolean> {
    this.logger.log(`Using pattern: UserService.Services.Delete`);
    try {
      const { id } = data;
      return await this.servicesService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete for service with this id: ${data.id}`,
        'UserService'
      );
    }
  }

  @MessagePattern(`UserService.Services.FindMany`)
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<Services>> {
    this.logger.log(`Using pattern: UserService.Services.FindMany`);
    try {
      const { paginationDto } = data;
      return await this.servicesService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 5,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'serviceName',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find many services`,
        'UserService'
      );
    }
  }

  @MessagePattern('UserService.Services.GetByDepartmentId')
  async getAllServiceProvidedByADepartment(
    @Payload() data: { departmentId: string }
  ) {
    try {
      return await this.servicesService.getAllServiceProvidedByADepartment(
        data.departmentId
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to get services by departmentId`,
        'UserService'
      );
    }
  }
}
