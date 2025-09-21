import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateImagingModalityDto } from './dto/create-imaging-modality.dto';
import { UpdateImagingModalityDto } from './dto/update-imaging-modality.dto';
import { ImagingModalityRepository } from './imaging-modalities.repository';
import { RepositoryPaginationDto } from '@backend/database';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';

@Injectable()
export class ImagingModalitiesService {
  constructor(
    @Inject()
    private readonly imagingModalityRepository: ImagingModalityRepository
  ) {}
  create = async (createImagingModalityDto: CreateImagingModalityDto) => {
    return await this.imagingModalityRepository.create(
      createImagingModalityDto
    );
  };

  findAll = async () => {
    return await this.imagingModalityRepository.findAll();
  };

  findOne = async (id: string) => {
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

    return modality;
  };

  update = async (
    id: string,
    updateImagingModalityDto: UpdateImagingModalityDto
  ) => {
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

  remove = async (id: string) => {
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

  findMany = async (paginationDto: RepositoryPaginationDto) => {
    return await this.imagingModalityRepository.paginate(paginationDto);
  };
}
