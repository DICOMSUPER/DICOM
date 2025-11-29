import { Controller, Inject, Logger } from '@nestjs/common';
import { ImageSegmentationLayersService } from './image-segmentation-layers.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';
import {
  CreateImageSegmentationLayerDto,
  UpdateImageSegmentationLayerDto,
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { RepositoryPaginationDto } from '@backend/database';

const moduleName = 'ImageSegmentationLayers';
@Controller('image-segmentation-layers')
export class ImageSegmentationLayersController {
  constructor(
    @Inject()
    private readonly imageSegmentationLayersService: ImageSegmentationLayersService
  ) {}

  private logger = new Logger(IMAGING_SERVICE);
  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async createImageSegmentationLayer(
    @Payload()
    data: {
      createImageSegmentationLayerDto: CreateImageSegmentationLayerDto;
    }
  ) {
    this.logger.log(
      'Using pattern: ' +
        `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      return await this.imageSegmentationLayersService.create(
        data.createImageSegmentationLayerDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create image segmentation layer',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAllImageSegmentationLayers(
    @Payload()
    data: {
      instanceId?: string;
    }
  ) {
    this.logger.log(
      'Using pattern: ' +
        `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.imageSegmentationLayersService.findAll(data.instanceId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to retrieve image segmentation layers',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findManyImageSegmentationLayers(
    @Payload()
    data: {
      paginationDto: RepositoryPaginationDto;
    }
  ) {
    this.logger.log(
      'Using pattern: ' +
        `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      return await this.imageSegmentationLayersService.findMany(
        data.paginationDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to retrieve image segmentation layers',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOneImageSegmentationLayer(
    @Payload()
    data: {
      id: string;
    }
  ) {
    this.logger.log(
      'Using pattern: ' +
        `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      return await this.imageSegmentationLayersService.findOne(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to retrieve image segmentation layer',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async updateImageSegmentationLayer(
    @Payload()
    data: {
      id: string;
      updateImageSegmentationLayerDto: UpdateImageSegmentationLayerDto;
    }
  ) {
    this.logger.log(
      'Using pattern: ' +
        `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      return await this.imageSegmentationLayersService.update(
        data.id,
        data.updateImageSegmentationLayerDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to update image segmentation layer',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`)
  async deleteImageSegmentationLayer(
    @Payload()
    data: {
      id: string;
    }
  ) {
    this.logger.log(
      'Using pattern: ' +
        `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.DELETE}`
    );
    try {
      return await this.imageSegmentationLayersService.delete(data.id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to delete image segmentation layer',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_BY_SERIES_ID}`
  )
  async findBySeriesId(
    @Payload()
    data: {
      seriesId: string;
    }
  ) {
    this.logger.log(
      'Using pattern: ' +
        `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_BY_SERIES_ID}`
    );
    try {
      return await this.imageSegmentationLayersService.findBySeriesId(
        data.seriesId
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to retrieve image segmentation layers by series ID',
        IMAGING_SERVICE
      );
    }
  }
}
