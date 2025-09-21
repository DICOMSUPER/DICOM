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
import { DicomStudiesService } from './dicom-studies.service';
import { CreateDicomStudyDto } from './dto/create-dicom-study.dto';
import { UpdateDicomStudyDto } from './dto/update-dicom-study.dto';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MESSAGE_PATTERNS,
  IMAGING_SERVICE,
} from '../../../constant/microservice.constant';
import { RepositoryPaginationDto } from '@backend/database';

const moduleName = 'DicomStudies';
@Controller('dicom-studies')
export class DicomStudiesController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(private readonly dicomStudiesService: DicomStudiesService) {}

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(@Payload() data: { createDicomStudyDto: CreateDicomStudyDto }) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`
    );
    try {
      const { createDicomStudyDto } = data;
      return await this.dicomStudiesService.create(createDicomStudyDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create dicom study',
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
      return await this.dicomStudiesService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all dicom study',
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
      return await this.dicomStudiesService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find dicom study with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`)
  async update(
    @Payload() data: { id: string; updateDicomStudyDto: UpdateDicomStudyDto }
  ) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.UPDATE}`
    );
    try {
      const { id, updateDicomStudyDto } = data;

      return await this.dicomStudiesService.update(id, updateDicomStudyDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update dicom study with id: ${data.id}`,
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
      return await this.dicomStudiesService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete dicom study with id: ${data.id}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`)
  async findDicomStudiesFromReferenceId(
    @Payload()
    data: {
      id: string;
      type:
        | 'modality'
        | 'order'
        | 'patient'
        | 'performingPhysician'
        | 'technician'
        | 'referringPhysician'
        | 'studyInstanceUid';
      paginationDto: RepositoryPaginationDto;
    }
  ) {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByReferenceId`
    );
    try {
      const { id, type, paginationDto } = data;
      return await this.dicomStudiesService.findDicomStudiesByReferenceId(
        id,
        type,
        {
          page: paginationDto?.page || 1,
          limit: paginationDto?.limit || 5,
          search: paginationDto?.search || '',
          searchField: paginationDto?.searchField || 'studyDescription',
          sortField: paginationDto?.sortField || 'createdAt',
          order: paginationDto?.order || 'asc',
        }
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find dicom studies by referenceId: ${data.id}`,
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
      return await this.dicomStudiesService.findMany({
        page: paginationDto?.page || 1,
        limit: paginationDto?.limit || 5,
        search: paginationDto?.search || '',
        searchField: paginationDto?.searchField || 'studyDescription',
        sortField: paginationDto?.sortField || 'createdAt',
        order: paginationDto?.order || 'asc',
      });
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find many dicom studies',
        IMAGING_SERVICE
      );
    }
  }
}
