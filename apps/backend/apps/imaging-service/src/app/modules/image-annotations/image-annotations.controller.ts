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
import { ImageAnnotationsService } from './image-annotations.service';
import {
  CreateImageAnnotationDto,
  ImageAnnotation,
} from '@backend/shared-domain';
import { UpdateImageAnnotationDto } from '@backend/shared-domain';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { FindFilterAnnotation } from './image-annotations.repository';

const moduleName = 'ImageAnnotations';
@Controller('image-annotations')
export class ImageAnnotationsController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(
    private readonly imageAnnotationsService: ImageAnnotationsService
  ) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createImageAnnotationDto: CreateImageAnnotationDto }
  ): Promise<ImageAnnotation> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createImageAnnotationDto } = data;
      return await this.imageAnnotationsService.create(
        createImageAnnotationDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create image annotation',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll(): Promise<ImageAnnotation[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.imageAnnotationsService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all image annotation',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<ImageAnnotation | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.imageAnnotationsService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find one for image annotation',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updateImageAnnotationDto: UpdateImageAnnotationDto;
    }
  ): Promise<ImageAnnotation | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateImageAnnotationDto } = data;
      return await this.imageAnnotationsService.update(
        id,
        updateImageAnnotationDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to update image annotation',
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
      return await this.imageAnnotationsService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to delete image annotation',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<ImageAnnotation>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.imageAnnotationsService.findMany({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'textContent',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many image annotation',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`)
  async findByReferenceId(
    @Payload()
    data: {
      id: string;
      type: FindFilterAnnotation;
      paginationDto: RepositoryPaginationDto;
    }
  ): Promise<PaginatedResponseDto<ImageAnnotation>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`
    );
    try {
      const { id, type, paginationDto } = data;
      return await this.imageAnnotationsService.findByReferenceId(id, type, {
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
        search: paginationDto.search || '',
        searchField: paginationDto.searchField || 'textContent',
        sortField: paginationDto.sortField || 'createdAt',
        order: paginationDto.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find by reference for image annotation',
        IMAGING_SERVICE
      );
    }
  }

  // check whether annotation reviewd in a study
  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.IsReviewedInStudy`)
  async isReviewedInStudy(studyId: string): Promise<{
    message: string;
    isReviewed: boolean;
  }> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.IsReviewedInStudy`
    );
    try {
      return await this.imageAnnotationsService.isReviewedInStudy(studyId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to check reviewed in study for image annotation',
        IMAGING_SERVICE
      );
    }
  }
}
