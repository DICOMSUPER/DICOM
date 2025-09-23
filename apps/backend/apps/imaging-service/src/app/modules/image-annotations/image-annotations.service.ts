import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateImageAnnotationDto,
  DicomInstance,
  ImageAnnotation,
} from '@backend/shared-domain';
import { UpdateImageAnnotationDto } from '@backend/shared-domain';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { ImageAnotationsRepository } from './image-anotations.repository';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';

const relation = ['instance'];
@Injectable()
export class ImageAnnotationsService {
  constructor(
    @Inject()
    private readonly imageAnnotationRepository: ImageAnotationsRepository,
    @Inject()
    private readonly dicomInstanceRepository: DicomInstancesRepository
  ) {}

  private checkImageAnotation = async (
    id: string
  ): Promise<ImageAnnotation> => {
    const annotation = await this.imageAnnotationRepository.findOne(
      {
        where: { id },
      },
      relation
    );
    if (!annotation) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Image annotation not found',
        IMAGING_SERVICE
      );
    }
    return annotation;
  };

  private checkDicomInstance = async (id: string): Promise<DicomInstance> => {
    const instance = await this.dicomInstanceRepository.findOne({
      where: { id },
    });

    if (!instance) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to process for image annotation: Dicom instance not found',
        IMAGING_SERVICE
      );
    }

    return instance;
  };

  create = async (
    createImageAnnotationDto: CreateImageAnnotationDto
  ): Promise<ImageAnnotation> => {
    return await this.imageAnnotationRepository.create(
      createImageAnnotationDto
    );
  };

  findAll = async (): Promise<ImageAnnotation[]> => {
    return await this.imageAnnotationRepository.findAll({}, relation);
  };

  findOne = async (id: string): Promise<ImageAnnotation | null> => {
    //check image anotation & since it's already queried
    return await this.checkImageAnotation(id);
  };

  update = async (
    id: string,
    updateImageAnnotationDto: UpdateImageAnnotationDto
  ): Promise<ImageAnnotation | null> => {
    const annotation = await this.checkImageAnotation(id);

    if (
      updateImageAnnotationDto.instanceId &&
      updateImageAnnotationDto.instanceId !== annotation.instanceId
    ) {
      await this.checkDicomInstance(updateImageAnnotationDto.instanceId);
    }
    return await this.imageAnnotationRepository.update(
      id,
      updateImageAnnotationDto
    );
  };

  remove = async (id: string): Promise<boolean> => {
    await this.checkImageAnotation(id);

    return await this.imageAnnotationRepository.softDelete(id, 'isDeleted');
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ImageAnnotation>> => {
    return await this.imageAnnotationRepository.paginate({
      ...paginationDto,
      relation,
    });
  };

  findByReferenceId = async (
    id: string,
    type: 'annotator' | 'instance',
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ImageAnnotation>> => {
    return await this.imageAnnotationRepository.findByReferenceId(id, type, {
      ...paginationDto,
      relation,
    });
  };
}
