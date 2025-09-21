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
import { ImagingModalitiesService } from './imaging-modalities.service';
import { CreateImagingModalityDto } from './dto/create-imaging-modality.dto';
import { UpdateImagingModalityDto } from './dto/update-imaging-modality.dto';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { MessagePattern, Payload } from '@nestjs/microservices/decorators';
import { ImagingModality } from './entities/imaging-modality.entity';
import { RepositoryPaginationDto } from '@backend/database';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';
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
  async findAll() {
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
  async findOne(@Payload() data: { id: string }) {
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
  ) {
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
  async remove(@Payload() data: { id: string }) {
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
  async findMany(@Payload() data: { paginationDto: RepositoryPaginationDto }) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.imagingModalitiesService.findMany({
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
        `Failed to find many modalities`,
        IMAGING_SERVICE
      );
    }
  }
}
