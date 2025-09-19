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

@Controller('imaging-modalities')
export class ImagingModalitiesController {
  private logger = new Logger('ImagingService');
  constructor(
    private readonly imagingModalitiesService: ImagingModalitiesService
  ) {}

  @MessagePattern('ImagingService.ImagingModality.Create')
  async create(
    @Payload() createImagingModalityDto: CreateImagingModalityDto
  ): Promise<ImagingModality> {
    this.logger.log('Using pattern: ImagingService.ImagingModality.Create');
    try {
      return await this.imagingModalitiesService.create(
        createImagingModalityDto
      );
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to create imaging modality',
        'ImagingService'
      );
    }
  }

  @MessagePattern('ImagingService.ImagingModality.FindAll')
  async findAll() {
    this.logger.log('Using pattern: ImagingService.ImagingModality.FindAll');
    try {
      return await this.imagingModalitiesService.findAll();
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        'Failed to find all imaging modality',
        'ImagingService'
      );
    }
  }

  @MessagePattern('ImagingService.ImagingModality.FindOne')
  async findOne(@Payload() data: { id: string }) {
    this.logger.log('Using pattern: ImagingService.ImagingModality.FindOne');
    try {
      const { id } = data;
      return await this.imagingModalitiesService.findOne(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to find imaging modality with id: ${data.id}`,
        'ImagingService'
      );
    }
  }

  @MessagePattern('ImagingService.ImagingModality.Update')
  update(
    @Payload()
    data: {
      id: string;
      updateImagingModalityDto: UpdateImagingModalityDto;
    }
  ) {
    this.logger.log('Using pattern: ImagingService.ImagingModality.Update');
    try {
      const { id, updateImagingModalityDto } = data;
      return this.imagingModalitiesService.update(id, updateImagingModalityDto);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to update for modality with this id: ${data.id}`,
        'ImagingService'
      );
    }
  }

  @MessagePattern('ImagingService.ImagingModality.Delete')
  async remove(@Payload() data: { id: string }) {
    this.logger.log('Using pattern: ImagingService.ImagingModality.Delete');
    try {
      const { id } = data;
      return await this.imagingModalitiesService.remove(id);
    } catch (error) {
      throw handleErrorFromMicroservices(
        error,
        `Failed to delete for modality with this id: ${data.id}`,
        'ImagingService'
      );
    }
  }

  @MessagePattern('ImagingService.ImagingModality.FindMany')
  async findMany(@Payload() data: { paginationDto: RepositoryPaginationDto }) {
    this.logger.log('Using pattern: ImagingService.ImagingModality.FindMany');
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
        'ImagingService'
      );
    }
  }
}
