import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateDicomInstanceDto } from '@backend/shared-domain';
import { UpdateDicomInstanceDto } from '@backend/shared-domain';
import {
  DicomInstancesRepository,
  ReferenceFieldInstanceType,
} from './dicom-instances.repository';
import { DicomSeriesRepository } from '../dicom-series/dicom-series.repository';
import { EntityManager } from 'typeorm';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { DicomSeries } from '@backend/shared-domain';
import { DicomInstance } from '@backend/shared-domain';
import {
  DicomInstanceNotFoundException,
  DicomInstanceSeriesNotFoundException,
  DicomInstanceInvalidModeException,
  DicomInstanceSeriesProcessException,
  DicomInstanceInternalException,
} from '@backend/shared-exception';

const relation = ['series'];

@Injectable()
export class DicomInstancesService {
  constructor(
    @Inject()
    private readonly dicomInstancesRepository: DicomInstancesRepository,
    @Inject()
    private readonly dicomSeriesRepository: DicomSeriesRepository,
    @Inject()
    private readonly dicomStudiesRepository: DicomStudiesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  private checkDicomSeries = async (
    id: string,
    em?: EntityManager
  ): Promise<DicomSeries> => {
    const series = await this.dicomSeriesRepository.findOne(
      { where: { id } },
      [],
      em
    );
    if (!series) {
      throw new DicomInstanceSeriesNotFoundException(
        'Failed to create dicom instance: dicom series not found'
      );
    }
    return series;
  };

  private checkDicomInstance = async (
    id: string,
    em?: EntityManager
  ): Promise<DicomInstance> => {
    const instance = await this.dicomInstancesRepository.findOne(
      {
        where: { id },
      },
      [],
      em
    );

    if (!instance) {
      throw new DicomInstanceNotFoundException();
    }
    return instance;
  };

  private getLatestInstanceNumber = async (
    id: string,
    em?: EntityManager
  ): Promise<number> => {
    let instanceNumber = 1;
    const instance = await this.dicomInstancesRepository.findOne(
      {
        where: { seriesId: id },
        order: { instanceNumber: -1 },
      },
      [],
      em
    );

    if (instance) {
      instanceNumber = instance.instanceNumber + 1;
    }

    return instanceNumber;
  };

  private updateDicomSeriesNumberOfInstance = async (
    id: string,
    quantity: number,
    mode: 'add' | 'subtract',
    entityManager?: EntityManager
  ): Promise<void> => {
    if (!['add', 'subtract'].includes(mode)) {
      throw new DicomInstanceInvalidModeException();
    }
    const series = await this.dicomSeriesRepository.findOne(
      { where: { id } },
      [],
      entityManager
    );
    if (!series) {
      throw new DicomInstanceSeriesProcessException(
        'Failed to process this dicom series: series not found'
      );
    }
    const newTotal =
      mode === 'add'
        ? series.numberOfInstances + quantity
        : series.numberOfInstances - quantity;

    if (newTotal < 0) {
      throw new DicomInstanceInternalException();
    }

    await this.dicomSeriesRepository.update(
      id,
      {
        numberOfInstances: newTotal,
      },
      entityManager
    );
  };

  create = async (
    createDicomInstanceDto: CreateDicomInstanceDto
  ): Promise<DicomInstance> => {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const series = await this.checkDicomSeries(
          createDicomInstanceDto.seriesId,
          transactionalEntityManager
        );

        await this.updateDicomSeriesNumberOfInstance(
          series.id,
          1,
          'add',
          transactionalEntityManager
        );

        const instanceNumber = await this.getLatestInstanceNumber(
          series.id,
          transactionalEntityManager
        );

        const data = {
          ...createDicomInstanceDto,
          instanceNumber: instanceNumber,
        };

        return await this.dicomInstancesRepository.create(
          data,
          transactionalEntityManager
        );
      }
    );
  };

  findAll = async (): Promise<DicomInstance[]> => {
    return await this.dicomInstancesRepository.findAll({}, relation);
  };

  findOne = async (id: string): Promise<DicomInstance | null> => {
    await this.checkDicomInstance(id);
    return await this.dicomInstancesRepository.findOne(
      { where: { id } },
      relation
    );
  };

  update = async (
    id: string,
    updateDicomInstanceDto: UpdateDicomInstanceDto
  ): Promise<DicomInstance | null> => {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        let updateData: any = updateDicomInstanceDto;
        const instance = await this.checkDicomInstance(
          id,
          transactionalEntityManager
        );

        if (
          updateDicomInstanceDto.seriesId &&
          updateDicomInstanceDto.seriesId !== instance.seriesId
        ) {
          await this.checkDicomSeries(
            updateDicomInstanceDto.seriesId,
            transactionalEntityManager
          );

          await this.updateDicomSeriesNumberOfInstance(
            instance.seriesId,
            1,
            'subtract',
            transactionalEntityManager
          );

          await this.updateDicomSeriesNumberOfInstance(
            updateDicomInstanceDto.seriesId,
            1,
            'add',
            transactionalEntityManager
          );

          const number = await this.getLatestInstanceNumber(
            updateDicomInstanceDto.seriesId,
            transactionalEntityManager
          );

          updateData = { ...updateDicomInstanceDto, instanceNumber: number };
        }

        return await this.dicomInstancesRepository.update(
          id,
          {
            ...updateData,
          },
          transactionalEntityManager
        );
      }
    );
  };

  remove = async (id: string): Promise<boolean> => {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const instance = await this.checkDicomInstance(
          id,
          transactionalEntityManager
        );

        await this.updateDicomSeriesNumberOfInstance(
          instance.seriesId,
          1,
          'subtract',
          transactionalEntityManager
        );
        return await this.dicomInstancesRepository.softDelete(
          id,
          'isDeleted',
          transactionalEntityManager
        );
      }
    );
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<DicomInstance>> => {
    return await this.dicomInstancesRepository.paginate({
      ...paginationDto,
      relation,
    });
  };

  findByReferenceId = async (
    id: string,
    type: ReferenceFieldInstanceType,
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<DicomInstance>> => {
    return await this.dicomInstancesRepository.findInstancesByReferenceId(
      id,
      type,
      paginationDto
    );
  };
}
