import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { CreateImagingModalityDto, ImagingModality, UpdateImagingModalityDto } from '@backend/shared-domain';
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
import { ImagingModalitiesService } from './imaging-modalities.service';
const moduleName = 'ImagingModalities';
@Controller('imaging-modalities')
export class ImagingModalitiesController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(
    private readonly imagingModalitiesService: ImagingModalitiesService
  ) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() createImagingModalityDto: CreateImagingModalityDto
  ): Promise<ImagingModality> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      return await this.imagingModalitiesService.create(
        createImagingModalityDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create imaging modality',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll(): Promise<ImagingModality[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.imagingModalitiesService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all imaging modality',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<ImagingModality | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.imagingModalitiesService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find imaging modality with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updateImagingModalityDto: UpdateImagingModalityDto;
    }
  ): Promise<ImagingModality | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateImagingModalityDto } = data;
      return await this.imagingModalitiesService.update(
        id,
        updateImagingModalityDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update for modality with this id: ${data.id}`,
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
      return await this.imagingModalitiesService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete for modality with this id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto & { includeInactive?: boolean; includeDeleted?: boolean } }
  ): Promise<PaginatedResponseDto<ImagingModality>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.imagingModalitiesService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'modalityName',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
        includeInactive: paginationDto.includeInactive,
        includeDeleted: paginationDto.includeDeleted,
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find many modalities`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.GetStats`)
  async getStats() {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.GetStats`
    );
    try {
      return await this.imagingModalitiesService.getStats();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get imaging modality stats',
        IMAGING_SERVICE
      );
    }
  }
}
