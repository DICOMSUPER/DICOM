import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateBodyPartDto,
  BodyPart,
  UpdateBodyPartDto,
} from '@backend/shared-domain';
import { BodyPartsRepository } from './body-parts.repository';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';

@Injectable()
export class BodyPartsService {
  constructor(
    @Inject()
    private readonly bodyPartsRepository: BodyPartsRepository
  ) {}

  private checkBodyPart = async (id: string): Promise<BodyPart> => {
    const bodyPart = await this.bodyPartsRepository.findOne({
      where: { id },
    });

    if (!bodyPart) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Body part not found',
        IMAGING_SERVICE
      );
    }

    return bodyPart;
  };

  create = async (createBodyPartDto: CreateBodyPartDto): Promise<BodyPart> => {
    return await this.bodyPartsRepository.create(createBodyPartDto);
  };

  findAll = async (): Promise<BodyPart[]> => {
    return await this.bodyPartsRepository.findAll();
  };

  findOne = async (id: string): Promise<BodyPart | null> => {
    await this.checkBodyPart(id);

    return await this.bodyPartsRepository.findOne({
      where: { id },
    });
  };

  update = async (
    id: string,
    updateBodyPartDto: UpdateBodyPartDto
  ): Promise<BodyPart | null> => {
    await this.checkBodyPart(id);

    return await this.bodyPartsRepository.update(id, updateBodyPartDto);
  };

  remove = async (id: string): Promise<boolean> => {
    await this.checkBodyPart(id);

    return await this.bodyPartsRepository.softDelete(id, 'isDeleted');
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<BodyPart>> => {
    return await this.bodyPartsRepository.paginate(paginationDto);
  };
}
