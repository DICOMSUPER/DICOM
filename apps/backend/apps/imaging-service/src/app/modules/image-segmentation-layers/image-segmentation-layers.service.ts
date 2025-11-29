import { Inject, Injectable } from '@nestjs/common';
import { ImageSegmentationLayersRepository } from './image-segmentation-layers.repository';
import {
  CreateImageSegmentationLayerDto,
  ImageSegmentationLayer,
  UpdateImageSegmentationLayerDto,
} from '@backend/shared-domain';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from '@backend/database';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';

@Injectable()
export class ImageSegmentationLayersService {
  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    @Inject()
    private readonly imageSegmentationLayersRepository: ImageSegmentationLayersRepository,
    @Inject()
    private readonly dicomInstancesRepository: DicomInstancesRepository
  ) {}

  checkDicomInstanceExists = async (instanceId: string) => {
    const dicomInstance = await this.dicomInstancesRepository.findOne({
      where: { id: instanceId, isDeleted: false },
    });
    if (!dicomInstance) {
      throw new Error(`DicomInstance with id ${instanceId} does not exist.`);
    }

    return dicomInstance;
  };

  create = async (
    createImageSegmentationLayerDto: CreateImageSegmentationLayerDto
  ): Promise<ImageSegmentationLayer> => {
    console.log('Body in create layer: ', createImageSegmentationLayerDto);
    return await this.em.transaction(async (transactionalEntityManager) => {
      await this.checkDicomInstanceExists(
        createImageSegmentationLayerDto.instanceId
      );

      return await this.imageSegmentationLayersRepository.create(
        createImageSegmentationLayerDto,
        transactionalEntityManager
      );
    });
  };

  findAll = async (instanceId?: string): Promise<ImageSegmentationLayer[]> => {
    const where: FindManyOptions<ImageSegmentationLayer>['where'] = {
      isDeleted: false,
    };
    if (instanceId) {
      where['instanceId'] = instanceId;
    }
    return await this.imageSegmentationLayersRepository.findAll({
      where: where,
    });
  };

  findOne = async (id: string): Promise<ImageSegmentationLayer | null> => {
    return await this.imageSegmentationLayersRepository.findOne({
      where: { id, isDeleted: false },
    });
  };

  findMany = async (
    paginationDto: PaginationDto
  ): Promise<PaginatedResponseDto<ImageSegmentationLayer>> => {
    return await this.imageSegmentationLayersRepository.paginate(paginationDto);
  };

  update = async (
    id: string,
    UpdateImageSegmentationLayerDto: UpdateImageSegmentationLayerDto
  ): Promise<ImageSegmentationLayer | null> => {
    return await this.em.transaction(async (transactionalEntityManager) => {
      if (UpdateImageSegmentationLayerDto.instanceId)
        await this.checkDicomInstanceExists(
          UpdateImageSegmentationLayerDto?.instanceId
        );

      const layer = await this.imageSegmentationLayersRepository.findOne(
        { where: { id, isDeleted: false } },
        [],
        transactionalEntityManager
      );
      if (!layer) {
        return null;
      }

      return await this.imageSegmentationLayersRepository.update(
        id,
        UpdateImageSegmentationLayerDto,
        transactionalEntityManager
      );
    });
  };

  delete = async (id: string): Promise<boolean> => {
    return await this.em.transaction(async (transactionalEntityManager) => {
      const layer = await this.imageSegmentationLayersRepository.findOne(
        { where: { id, isDeleted: false } },
        [],
        transactionalEntityManager
      );
      if (!layer) {
        return false;
      }
      await this.imageSegmentationLayersRepository.softDelete(
        id,
        'isDeleted',
        transactionalEntityManager
      );
      return true;
    });
  };

  findBySeriesId = async (
    seriesId: string
  ): Promise<ImageSegmentationLayer[]> => {
    return this.imageSegmentationLayersRepository.findBySeriesId(seriesId);
  };
}
