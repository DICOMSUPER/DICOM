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
import { DicomSeriesService } from './dicom-series.service';
import { CreateDicomSeryDto } from './dto/create-dicom-sery.dto';
import { UpdateDicomSeryDto } from './dto/update-dicom-sery.dto';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MESSAGE_PATTERNS,
  IMAGING_SERVICE,
} from '../../../constant/microservice.constant';
import { RepositoryPaginationDto } from '@backend/database';

const moduleName = 'DicomSeries';
@Controller('dicom-series')
export class DicomSeriesController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(private readonly dicomSeriesService: DicomSeriesService) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(@Payload() data: { createDicomSeryDto: CreateDicomSeryDto }) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createDicomSeryDto } = data;
      return await this.dicomSeriesService.create(createDicomSeryDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create dicom series',
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
      return await this.dicomSeriesService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all dicom series',
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
      return await this.dicomSeriesService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find dicom series with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload() data: { id: string; updateDicomSeryDto: UpdateDicomSeryDto }
  ) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateDicomSeryDto } = data;
      return await this.dicomSeriesService.update(id, updateDicomSeryDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update dicom series with id: ${data.id}`,
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
      return await this.dicomSeriesService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete dicom series with id: ${data.id}`,
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
      return await this.dicomSeriesService.findMany({
        page: paginationDto?.page || 1,
        limit: paginationDto?.limit || 5,
        search: paginationDto?.search || '',
        searchField: paginationDto?.searchField || 'seriesDescription',
        sortField: paginationDto?.sortField || 'createdAt',
        order: paginationDto?.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many dicom series',
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`)
  async findByReferenceId(
    @Payload()
    data: {
      id: string;
      type: 'study' | 'seriesInstanceUid' | 'order' | 'modality';
      paginationDto: RepositoryPaginationDto;
    }
  ) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`
    );
    try {
      const { id, type, paginationDto } = data;
      return await this.dicomSeriesService.findByReferenceId(id, type, {
        page: paginationDto?.page || 1,
        limit: paginationDto?.limit || 5,
        search: paginationDto?.search || '',
        searchField: paginationDto?.searchField || 'seriesDescription',
        sortField: paginationDto?.sortField || 'createdAt',
        order: paginationDto?.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find reference for dicom series with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }
}
