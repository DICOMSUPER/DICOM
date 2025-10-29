import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreateImagingOrderDto,
  ImagingOrder,
  UpdateImagingOrderDto,
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';
import { ImagingOrdersService } from './imaging-orders.service';
import type { FilterByRoomIdType } from './imaging-orders.repository';

const moduleName = 'ImagingOrders';
@Controller()
export class ImagingOrdersController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(private readonly imagingOrdersService: ImagingOrdersService) { }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(@Payload() createImagingOrderDto: any): Promise<ImagingOrder> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      // const { createImagingOrderDto } = data;
      console.log('dto', createImagingOrderDto);

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
  async findAll(): Promise<ImagingOrder[]> {
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
  async findOne(@Payload() data: { id: string }): Promise<ImagingOrder | null> {
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
  ): Promise<ImagingOrder | null> {
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
  async remove(@Payload() data: { id: string }): Promise<boolean> {
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
  ): Promise<PaginatedResponseDto<ImagingOrder>> {
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
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<ImagingOrder>> {
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

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FilterByRoomId`)
  async filterOrderByRoomIdType(@Payload() data: FilterByRoomIdType) {
    try {
      return await this.imagingOrdersService.filterImagingOrderByRoomId(data);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to filter imaging order by roomId',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.GetQueueStats`)
  async getRoomOrderStats(@Payload() data: { id: string }) {
    try {
      return await this.imagingOrdersService.getRoomStats(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get imaging order room stats',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.FindByPatientId`
  ) async findManyByPatientId(
    @Payload() data: { patientId: string }
  ): Promise<ImagingOrder[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByPatientId`
    );
    try {
      const { patientId } = data;
      return await this.imagingOrdersService.findManyByPatientId(patientId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find imaging orders for patient with id: ${data.patientId}`,
        IMAGING_SERVICE
      );
    }
  }
  }
