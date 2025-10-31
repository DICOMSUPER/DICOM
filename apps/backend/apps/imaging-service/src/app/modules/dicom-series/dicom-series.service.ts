import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateDicomSeriesDto,
  DicomSeries,
  DicomStudy,
} from '@backend/shared-domain';
import { UpdateDicomSeriesDto } from '@backend/shared-domain';
import {
  DicomSeriesRepository,
  SeriesReferenceType,
} from './dicom-series.repository';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';

import {
  DicomSeriesNotFoundException,
  DicomSeriesStudyNotFoundException,
  DicomSeriesInvalidModeException,
  DicomSeriesInternalException,
  DicomSeriesStudyProcessException,
} from '@backend/shared-exception';

const relation = ['study', 'instances'];

@Injectable()
export class DicomSeriesService {
  constructor(
    @Inject()
    private readonly dicomInstancesRepository: DicomInstancesRepository,
    @Inject() private readonly dicomSeriesRepository: DicomSeriesRepository,
    @Inject() private readonly dicomStudiesRepository: DicomStudiesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  private getLatestDicomSeriesNumber = async (
    id: string,
    em?: EntityManager
  ): Promise<number> => {
    let seriesNumber = 1;
    const latestDicomSeries = await this.dicomSeriesRepository.findOne(
      {
        where: { studyId: id },
        order: { seriesNumber: -1 },
      },
      [],
      em
    );

    if (latestDicomSeries) {
      seriesNumber = latestDicomSeries.seriesNumber + 1;
    }

    return seriesNumber;
  };

  private updateDicomStudyNumberOfSeries = async (
    id: string,
    quantity: number,
    mode: 'add' | 'subtract',
    entityManager?: EntityManager
  ): Promise<void> => {
    if (!['add', 'subtract'].includes(mode)) {
      throw new DicomSeriesInvalidModeException({ mode });
    }

    const study = await this.dicomStudiesRepository.findOne(
      { where: { id } },
      [],
      entityManager
    );

    if (!study) {
      throw new DicomSeriesStudyNotFoundException({ studyId: id });
    }

    const newTotal =
      mode === 'add'
        ? study.numberOfSeries + quantity
        : study.numberOfSeries - quantity;

    if (newTotal < 0) {
      throw new DicomSeriesInternalException({
        message: 'Negative number of series not allowed',
        currentTotal: study.numberOfSeries,
        quantity,
      });
    }

    await this.dicomStudiesRepository.update(
      id,
      { numberOfSeries: newTotal },
      entityManager
    );
  };

  private checkDicomSeries = async (
    id: string,
    entityManager?: EntityManager
  ): Promise<DicomSeries> => {
    const series = await this.dicomSeriesRepository.findOne(
      { where: { id } },
      [],
      entityManager
    );
    if (!series) {
      throw new DicomSeriesNotFoundException({ seriesId: id });
    }
    return series;
  };

  private checkDicomStudy = async (
    id: string,
    entityManager?: EntityManager
  ): Promise<DicomStudy> => {
    const study = await this.dicomStudiesRepository.findOne(
      { where: { id } },
      [],
      entityManager
    );

    if (!study) {
      throw new DicomSeriesStudyProcessException({ studyId: id });
    }

    return study;
  };

  create = async (
    createDicomSeriesDto: CreateDicomSeriesDto
  ): Promise<DicomSeries> => {
    return this.entityManager.transaction(async (em) => {
      await this.checkDicomStudy(createDicomSeriesDto.studyId, em);
      await this.updateDicomStudyNumberOfSeries(
        createDicomSeriesDto.studyId,
        1,
        'add',
        em
      );

      const seriesNumber = await this.getLatestDicomSeriesNumber(
        createDicomSeriesDto.studyId,
        em
      );

      return await this.dicomSeriesRepository.create(
        {
          ...createDicomSeriesDto,
          seriesNumber: seriesNumber,
          numberOfInstances: 0,
        },
        em
      );
    });
  };

  findAll = async (): Promise<DicomSeries[]> => {
    return await this.dicomSeriesRepository.findAll({}, relation);
  };

  findOne = async (id: string): Promise<DicomSeries | null> => {
    await this.checkDicomSeries(id);

    return await this.dicomSeriesRepository.findOne(
      { where: { id } },
      relation
    );
  };

  update = async (
    id: string,
    updateDicomSeriesDto: UpdateDicomSeriesDto
  ): Promise<DicomSeries | null> => {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const series = await this.checkDicomSeries(
          id,
          transactionalEntityManager
        );
        let updateData = updateDicomSeriesDto;

        if (
          updateDicomSeriesDto.studyId &&
          series.studyId !== updateDicomSeriesDto.studyId
        ) {
          const newStudy = await this.checkDicomStudy(
            updateDicomSeriesDto.studyId,
            transactionalEntityManager
          );

          await this.updateDicomStudyNumberOfSeries(
            series.studyId,
            1,
            'subtract',
            transactionalEntityManager
          );

          await this.updateDicomStudyNumberOfSeries(
            newStudy.id,
            1,
            'add',
            transactionalEntityManager
          );

          updateData = {
            ...updateDicomSeriesDto,
            seriesNumber: await this.getLatestDicomSeriesNumber(newStudy.id),
          };
        }

        return await this.dicomSeriesRepository.update(
          id,
          updateData,
          transactionalEntityManager
        );
      }
    );
  };

  remove = async (id: string): Promise<boolean> => {
    return this.entityManager.transaction(async (em) => {
      const series = await this.checkDicomSeries(id);
      await this.updateDicomStudyNumberOfSeries(
        series.studyId,
        1,
        'subtract',
        em
      );
      return await this.dicomSeriesRepository.softDelete(id, 'isDeleted', em);
    });
  };

  findMany = async (
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<DicomSeries>> => {
    return await this.dicomSeriesRepository.paginate(paginationDto);
  };

  findByReferenceId = async (
    id: string,
    type: SeriesReferenceType,
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedResponseDto<DicomSeries>> => {
    return await this.dicomSeriesRepository.findSeriesByReferenceId(id, type, {
      ...paginationDto,
      relation,
    });
  };
}
