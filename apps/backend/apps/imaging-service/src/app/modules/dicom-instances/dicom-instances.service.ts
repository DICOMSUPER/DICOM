import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateDicomInstanceDto } from '@backend/shared-domain';
import { UpdateDicomInstanceDto } from '@backend/shared-domain';
import { DicomInstancesRepository } from './dicom-instances.repository';
import { DicomSeriesRepository } from '../dicom-series/dicom-series.repository';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { EntityManager } from 'typeorm';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { DicomSeries } from '@backend/shared-domain';
import { DicomInstance } from '@backend/shared-domain';
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
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to create dicom instance: dicom series not found',
        IMAGING_SERVICE
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
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Dicom instance not found',
        IMAGING_SERVICE
      );
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
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to update number of series for study: invalid mode',
        IMAGING_SERVICE
      );
    }
    const series = await this.dicomSeriesRepository.findOne(
      { where: { id } },
      [],
      entityManager
    );
    if (!series) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to process this dicom series: series not found',
        IMAGING_SERVICE
      );
    }
    const newTotal =
      mode === 'add'
        ? series.numberOfInstances + quantity
        : series.numberOfInstances - quantity;

    if (newTotal < 0) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
        IMAGING_SERVICE
      );
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
    //check dicom series
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const series = await this.checkDicomSeries(
          createDicomInstanceDto.seriesId,
          transactionalEntityManager
        );

        //update number of instance in series
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
        //add instance number into instance
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
    //check dicomInstance
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
        //check dicomInstance
        const instance = await this.checkDicomInstance(
          id,
          transactionalEntityManager
        );

        //check dicom series if provided
        if (
          updateDicomInstanceDto.seriesId &&
          updateDicomInstanceDto.seriesId !== instance.seriesId
        ) {
          //new series available
          await this.checkDicomSeries(
            updateDicomInstanceDto.seriesId,
            transactionalEntityManager
          );

          //update old series number of instance
          await this.updateDicomSeriesNumberOfInstance(
            instance.seriesId,
            1,
            'subtract',
            transactionalEntityManager
          );
          //update new series number of instance
          await this.updateDicomSeriesNumberOfInstance(
            updateDicomInstanceDto.seriesId,
            1,
            'add',
            transactionalEntityManager
          );

          //get new series & update instance number for this instance
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
    //update number of instance in series
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
    type: 'series' | 'sopInstanceUid',
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<DicomInstance>> => {
    return await this.dicomInstancesRepository.findInstancesByReferenceId(
      id,
      type,
      paginationDto
    );
  };
}
