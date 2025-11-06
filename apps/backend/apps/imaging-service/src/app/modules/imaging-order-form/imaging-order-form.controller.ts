// imaging-order-form.controller.ts
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  FilterImagingOrderFormDto,
  FilterImagingOrderFormServiceDto,
  ImagingOrder,
  ImagingOrderForm,
  UpdateImagingOrderFormDto
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';
import { ImagingOrderFormService, OrderFormStats } from './imaging-order-form.service';

const moduleName = 'ImagingOrderForm';

@Controller()
export class ImagingOrderFormController {
  private logger = new Logger(IMAGING_SERVICE);
  
  constructor(
    private readonly imagingOrderFormService: ImagingOrderFormService,
  ) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createImagingOrderFormDto: any, userId: string }
  ) {
    console.log("create dto", data.createImagingOrderFormDto);
    console.log("user id", data.userId);
    
    
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      return await this.imagingOrderFormService.create(data.createImagingOrderFormDto, data.userId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create imaging order form',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll(
    @Payload() data: { filter: any, userId: string }
  ): Promise<PaginatedResponseDto<ImagingOrderForm>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.imagingOrderFormService.findAll(data.filter, data.userId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all imaging order forms',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<ImagingOrderForm | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.imagingOrderFormService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find imaging order form with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updateDto: UpdateImagingOrderFormDto;
    }
  ): Promise<ImagingOrderForm | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateDto } = data;
      return await this.imagingOrderFormService.update(id, updateDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update imaging order form with id: ${data.id}`,
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
      await this.imagingOrderFormService.remove(id);
      return true;
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete imaging order form with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ){
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.imagingOrderFormService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 5,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'patientId',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many imaging order forms',
        IMAGING_SERVICE
      );
    }
  }

  // @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`)
  // async findByReferenceId(
  //   @Payload()
  //   data: {
  //     id: string;
  //     type: 'physician' | 'patient' | 'room';
  //     paginationDto: RepositoryPaginationDto;
  //   }
  // ): Promise<PaginatedResponseDto<ImagingOrderForm>> {
  //   this.logger.log(
  //     `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`
  //   );
  //   try {
  //     const { id, type, paginationDto } = data;
  //     return await this.imagingOrderFormService.findByReferenceId(id, type, {
  //       page: paginationDto.page || 1,
  //       limit: paginationDto.limit || 5,
  //       search: paginationDto.search || '',
  //       searchField: paginationDto.searchField || 'patientId',
  //       sortField: paginationDto.sortField || 'createdAt',
  //       order: paginationDto.order || 'asc',
  //     });
  //   } catch (error) {
  //     throw handleErrorFromMicroservices(
  //       error,
  //       `Failed to find imaging order forms by ${data.type} with id: ${data.id}`,
  //       IMAGING_SERVICE
  //     );
  //   }
  // }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.GetOrders`)
  async getOrders(
    @Payload() data: { orderFormId: string }
  ): Promise<ImagingOrder[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.GetOrders`
    );
    try {
      const { orderFormId } = data;
      return await this.imagingOrderFormService.getOrdersByFormId(orderFormId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to get orders for order form with id: ${data.orderFormId}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.GetStatistics`)
  async getStatistics(
    @Payload() data: { orderFormId: string }
  ): Promise<OrderFormStats> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.GetStatistics`
    );
    try {
      const { orderFormId } = data;
      return await this.imagingOrderFormService.getOrderFormStatistics(
        orderFormId
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to get statistics for order form with id: ${data.orderFormId}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.CheckAndUpdateStatus`)
  async checkAndUpdateStatus(
    @Payload() data: { orderFormId: string }
  ): Promise<void> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.CheckAndUpdateStatus`
    );
    try {
      const { orderFormId } = data;
      await this.imagingOrderFormService.autoUpdateOrderFormStatus(orderFormId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to check and update status for order form with id: ${data.orderFormId}`,
        IMAGING_SERVICE
      );
    }
  }
  
  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FindByPatientId`)
  async findByPatientId(
    @Payload()
    data: {
      patientId: string;
      paginationDto?: RepositoryPaginationDto;
    }
  ): Promise<PaginatedResponseDto<ImagingOrderForm>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByPatientId`
    );
    try {
      const { patientId, paginationDto } = data;
      return await this.imagingOrderFormService.findByPatientId(
        patientId,
        paginationDto
          ? {
              page: paginationDto.page || 1,
              limit: paginationDto.limit || 10,
              search: paginationDto.search || '',
              sortField: paginationDto.sortField || 'createdAt',
              order: paginationDto.order || 'DESC',
            }
          : undefined
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find imaging order forms for patient with id: ${data.patientId}`,
        IMAGING_SERVICE
      );
    }
  }
  
}