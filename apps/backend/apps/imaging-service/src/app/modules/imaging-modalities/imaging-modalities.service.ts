import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateImagingModalityDto,
  ImagingModality,
} from '@backend/shared-domain';
import { UpdateImagingModalityDto } from '@backend/shared-domain';
import { ImagingModalityRepository } from './imaging-modalities.repository';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';

const relations = ['modalityMachines'];
@Injectable()
export class ImagingModalitiesService {
  constructor(
    @Inject()
    private readonly imagingModalityRepository: ImagingModalityRepository
  ) {}
  create = async (
    createImagingModalityDto: CreateImagingModalityDto
  ): Promise<ImagingModality> => {
    return await this.imagingModalityRepository.create(
      createImagingModalityDto
    );
  };

  findAll = async (): Promise<ImagingModality[]> => {
    return await this.imagingModalityRepository.findAll(
      {
        where: { isDeleted: false, isActive: true },
      },
      relations
    );
  };

  findOne = async (id: string): Promise<ImagingModality | null> => {
    const modality = await this.imagingModalityRepository.findOne({
      where: { id },
      relations,
    });

    if (!modality) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Modality not found',
        IMAGING_SERVICE
      );
    }

    return modality;
  };

  update = async (
    id: string,
    updateImagingModalityDto: UpdateImagingModalityDto
  ): Promise<ImagingModality | null> => {
    const modality = await this.imagingModalityRepository.findOne({
      where: { id },
    });

    if (!modality) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Modality not found',
        IMAGING_SERVICE
      );
    }

    return await this.imagingModalityRepository.update(
      id,
      updateImagingModalityDto
    );
  };

  remove = async (id: string): Promise<boolean> => {
    const modality = await this.imagingModalityRepository.findOne({
      where: { id },
    });

    if (!modality) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Modality not found',
        IMAGING_SERVICE
      );
    }

    return await this.imagingModalityRepository.softDelete(id, 'isDeleted');
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ImagingModality>> => {
    return await this.imagingModalityRepository.paginate(paginationDto);
  };
}
