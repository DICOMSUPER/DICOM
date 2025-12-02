import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@backend/database';
import { ImageSegmentationLayer } from '@backend/shared-domain';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class ImageSegmentationLayersRepository extends BaseRepository<ImageSegmentationLayer> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(ImageSegmentationLayer, entityManager);
  }

  async findBySeriesId(seriesId: string): Promise<ImageSegmentationLayer[]> {
    return this.getRepository()
      .createQueryBuilder('imageSegmentationLayer')
      .leftJoinAndSelect('imageSegmentationLayer.instance', 'dicomInstance')
      .where('dicomInstance.seriesId = :seriesId', { seriesId })
      .andWhere('imageSegmentationLayer.isDeleted = false')
      .getMany();
  }
}
