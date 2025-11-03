import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import {
  CreateDicomStudyDto,
  DicomStudy,
  UpdateDicomStudyDto,
} from '@backend/shared-domain';
import { handleErrorFromMicroservices } from '@backend/shared-utils';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  IMAGING_SERVICE,
  MESSAGE_PATTERNS,
} from '../../../constant/microservice.constant';
import { findDicomStudyByReferenceIdType } from './dicom-studies.repository';
import { DicomStudyStatus, Roles } from '@backend/shared-enums';
import { DicomStudiesService } from './dicom-studies.service';

const moduleName = 'DicomStudies';
@Controller('dicom-studies')
export class DicomStudiesController {
  private logger = new Logger(IMAGING_SERVICE);
  constructor(private readonly dicomStudiesService: DicomStudiesService) { }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.${MESSAGE_PATTERNS.CREATE}`)
  async create(
    @Payload() data: { createDicomStudyDto: CreateDicomStudyDto }
  ): Promise<DicomStudy> {
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
  async findAll(): Promise<DicomStudy[]> {
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
  async findOne(@Payload() data: { id: string }): Promise<DicomStudy | null> {
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
  ): Promise<DicomStudy | null> {
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
  async remove(@Payload() data: { id: string }): Promise<boolean> {
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
      type: findDicomStudyByReferenceIdType;
      paginationDto: RepositoryPaginationDto;
    }
  ): Promise<PaginatedResponseDto<DicomStudy>> {
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
  async findMany(
    @Payload() data: { paginationDto: RepositoryPaginationDto }
  ): Promise<PaginatedResponseDto<DicomStudy>> {
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

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.FindByOrderId`)
  async findByOrderId(
    @Payload() data: { orderId: string }
  ): Promise<DicomStudy[]> {
    this.logger.log(
      `Using pattern: ${IMAGING_SERVICE}.${moduleName}.FindByOrderId`
    );
    try {
      const { orderId } = data;
      return await this.dicomStudiesService.findByOrderId(orderId);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find dicom studies by orderId: ${data.orderId}`,
        IMAGING_SERVICE
      );
    }
  }

  @MessagePattern(`${IMAGING_SERVICE}.${moduleName}.Filter`)
  async filterStudy(
    @Payload()
    data: FilterData
  ) {
    this.logger.log(`Using pattern: ${IMAGING_SERVICE}.${moduleName}.Filter`);
    try {
      return await this.dicomStudiesService.filter(data);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to filter dicom study',
        IMAGING_SERVICE
      );
    }
  }
}


export interface FilterData {
  role?: Roles;
  studyUID?: string;
  startDate?: string;
  endDate?: string;
  bodyPart?: string;
  modalityId?: string;
  modalityMachineId?: string;
  studyStatus?: DicomStudyStatus;
}
