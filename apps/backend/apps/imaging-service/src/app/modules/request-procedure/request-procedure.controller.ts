import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { CreateRequestProcedureDto, RequestProcedure, UpdateRequestProcedureDto } from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import {
  Controller,
  Logger
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';
import { RequestProcedureService } from './request-procedure.service';
const moduleName = 'RequestProcedure';
@Controller()
export class RequestProcedureController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(
    private readonly requestProcedureService: RequestProcedureService
  ) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() createRequestProcedureDto: CreateRequestProcedureDto
  ): Promise<RequestProcedure> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      return await this.requestProcedureService.create(
        createRequestProcedureDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create request procedure',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll(
    @Payload() data: { bodyPartId?: string; modalityId?: string }
  ): Promise<RequestProcedure[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.requestProcedureService.findAll(data);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all request procedures',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<RequestProcedure | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.requestProcedureService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find request procedure with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updateRequestProcedureDto: UpdateRequestProcedureDto;
    }
  ): Promise<RequestProcedure | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateRequestProcedureDto } = data;
      return await this.requestProcedureService.update(
        id,
        updateRequestProcedureDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update for request procedure with this id: ${data.id}`,
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
      return await this.requestProcedureService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete for request procedure with this id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<RequestProcedure>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.requestProcedureService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'procedureName',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find many modalities`,
        IMAGING_SERVICE
      );
    }
  }
}
