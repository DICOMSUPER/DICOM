import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { ImagingOrdersService } from './imaging-orders.service';
import { CreateImagingOrderDto } from './dto/create-imaging-order.dto';
import { UpdateImagingOrderDto } from './dto/update-imaging-order.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RepositoryPaginationDto } from '@backend/database';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';

const moduleName = 'ImagingOrders';
@Controller('imaging-orders')
export class ImagingOrdersController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(private readonly imagingOrdersService: ImagingOrdersService) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createImagingOrderDto: CreateImagingOrderDto }
  ) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createImagingOrderDto } = data;
      return await this.imagingOrdersService.create(createImagingOrderDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create imaging order',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll() {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.imagingOrdersService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all imaging order',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(@Payload() data: { id: string }) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.imagingOrdersService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find imaging order with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updateImagingOrderDto: UpdateImagingOrderDto;
    }
  ) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateImagingOrderDto } = data;
      return await this.imagingOrdersService.update(id, updateImagingOrderDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update imaging order with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`)
  async remove(@Payload() data: { id: string }) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`
    );
    try {
      const { id } = data;
      return await this.imagingOrdersService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete imaging order with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`)
  async findImagingOrderByReferenceId(
    @Payload()
    data: {
      id: string;
      type: 'physician' | 'room' | 'patient' | 'visit';
      paginationDto: RepositoryPaginationDto;
    }
  ) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`
    );
    try {
      const { id, type, paginationDto } = data;
      return await this.imagingOrdersService.findImagingOrderByReferenceId(
        id,
        type,
        {
          page: paginationDto.page || 1,
          limit: paginationDto.limit || 5,
          search: paginationDto.search || '',
          searchField: paginationDto.searchField || 'orderNumber',
          sortField: paginationDto.sortField || 'createdAt',
          order: paginationDto.order || 'asc',
        }
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find imaging order by reference with id: ${data.id} for ${data.type}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(@Payload() data: { paginationDto: RepositoryPaginationDto }) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.imagingOrdersService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 5,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'modalityName',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many imaging order',
        IMAGING_SERVICE
      );
    }
  }
}
