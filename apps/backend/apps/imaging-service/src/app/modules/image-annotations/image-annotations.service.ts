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
import {
  FindFilterAnnotation,
  ImageAnnotationsRepository,
} from './image-annotations.repository';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';
import { EntityManager } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';
import { AnnotationStatus } from '@backend/shared-enums';

const relation = ['instance'];
@Injectable()
export class ImageAnnotationsService {
  constructor(
    @Inject()
    private readonly imageAnnotationRepository: ImageAnnotationsRepository,
    @Inject()
    private readonly dicomInstanceRepository: DicomInstancesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @Inject()
    private readonly dicomStudiesRepository: DicomStudiesRepository
  ) {}

  private checkImageAnnotation = async (
    id: string,
    em?: EntityManager
  ): Promise<ImageAnnotation> => {
    const annotation = await this.imageAnnotationRepository.findOne(
      {
        where: { id },
      },
      relation,
      em
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

  private checkDicomInstance = async (
    id: string,
    em?: EntityManager
  ): Promise<DicomInstance> => {
    const instance = await this.dicomInstanceRepository.findOne(
      {
        where: { id },
      },
      [],
      em
    );

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
    return await this.entityManager.transaction(async (em) => {
      return await this.imageAnnotationRepository.create(
        createImageAnnotationDto,
        em
      );
    });
  };

  findAll = async (): Promise<ImageAnnotation[]> => {
    return await this.imageAnnotationRepository.findAll({}, relation);
  };

  findOne = async (id: string): Promise<ImageAnnotation | null> => {
    //check image anotation & since it's already queried
    return await this.checkImageAnnotation(id);
  };

  update = async (
    id: string,
    updateImageAnnotationDto: UpdateImageAnnotationDto
  ): Promise<ImageAnnotation | null> => {
    return await this.entityManager.transaction(async (em) => {
      const annotation = await this.checkImageAnnotation(id, em);

      if (
        updateImageAnnotationDto.instanceId &&
        updateImageAnnotationDto.instanceId !== annotation.instanceId
      ) {
        await this.checkDicomInstance(updateImageAnnotationDto.instanceId, em);
      }
      return await this.imageAnnotationRepository.update(
        id,
        updateImageAnnotationDto,
        em
      );
    });
  };

  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(async (em) => {
      await this.checkImageAnnotation(id, em);

      return await this.imageAnnotationRepository.softDelete(
        id,
        'isDeleted',
        em
      );
    });
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
    type: FindFilterAnnotation,
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<ImageAnnotation>> => {
    return await this.imageAnnotationRepository.findByReferenceId(id, type, {
      ...paginationDto,
      relation,
    });
  };

  isReviewedInStudy = async (
    studyId: string
  ): Promise<{
    message: string;
    isReviewed: boolean;
  }> => {
    const study = await this.dicomStudiesRepository.findOne({
      where: { id: studyId },
      relations: [
        'series',
        'series.instances',
        'series.instances.imageAnnotations',
      ],
    });

    if (!study) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Dicom study not found',
        IMAGING_SERVICE
      );
    }

    const allAnnotations = study.series.flatMap((series) =>
      series.instances.flatMap((instance) => instance.imageAnnotations)
    );

    if (allAnnotations.length === 0) {
      return {
        message: 'No annotations found in the study',
        isReviewed: false,
      };
    }

    const isReviewed = allAnnotations.every(
      (annotation) => annotation.annotationStatus === AnnotationStatus.REVIEWED
    );

    if (!isReviewed) {
      return {
        message: 'Not all annotations have been reviewed',
        isReviewed: false,
      };
    }

    return {
      message: 'All annotations have been reviewed',
      isReviewed: true,
    };
  };
}
