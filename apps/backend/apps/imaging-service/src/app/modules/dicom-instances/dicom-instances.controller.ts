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
import { DicomInstancesService } from './dicom-instances.service';
import { CreateDicomInstanceDto, DicomInstance } from '@backend/shared-domain';
import { UpdateDicomInstanceDto } from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MESSAGE_PATTERNS,
  IMAGING_SERVICE,
} from '../../../constant/microservice.constant';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';

const moduleName = 'DicomInstances';
@Controller('dicom-instances')
export class DicomInstancesController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(private readonly dicomInstancesService: DicomInstancesService) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createDicomInstanceDto: CreateDicomInstanceDto }
  ): Promise<DicomInstance> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createDicomInstanceDto } = data;
      return await this.dicomInstancesService.create(createDicomInstanceDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create dicom instance',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
  )
  async findAll(): Promise<DicomInstance[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ALL}`
    );
    try {
      return await this.dicomInstancesService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all dicom instances',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
  )
  async findOne(
    @Payload() data: { id: string }
  ): Promise<DicomInstance | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_ONE}`
    );
    try {
      const { id } = data;
      return await this.dicomInstancesService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find dicom instance with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload()
    data: {
      id: string;
      updateDicomInstanceDto: UpdateDicomInstanceDto;
    }
  ): Promise<DicomInstance | null> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateDicomInstanceDto } = data;
      return await this.dicomInstancesService.update(
        id,
        updateDicomInstanceDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update dicom instance with id: ${data.id}`,
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
      return await this.dicomInstancesService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete dicom instance with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(
    `${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
  )
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<DicomInstance>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.FIND_MANY}`
    );
    try {
      const { paginationDto } = data;
      return await this.dicomInstancesService.findMany({
        page: paginationDto?.page || 1,
        limit: paginationDto?.limit || 5,
        search: paginationDto?.search || '',
        searchField: paginationDto?.searchField || 'fileName',
        sortField: paginationDto?.sortField || 'createdAt',
        order: paginationDto?.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get many dicom instance',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`)
  async findByReference(
    @Payload()
    data: {
      id: string;
      type: 'sopInstanceUid' | 'series';
      paginationDto: RepositoryPaginationDto;
    }
  ): Promise<PaginatedResponseDto<DicomInstance>> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`
    );
    try {
      const { id, type, paginationDto } = data;
      return await this.dicomInstancesService.findByReferenceId(id, type, {
        page: paginationDto?.page || 1,
        limit: paginationDto?.limit || 5,
        search: paginationDto?.search || '',
        searchField: paginationDto?.searchField || 'fileName',
        sortField: paginationDto?.sortField || 'createdAt',
        order: paginationDto?.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to get by find dicom instance by referenceId',
        IMAGING_SERVICE
      );
    }
  }
}
