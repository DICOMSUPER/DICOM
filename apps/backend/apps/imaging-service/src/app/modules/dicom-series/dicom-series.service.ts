import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateDicomSeryDto } from './dto/create-dicom-sery.dto';
import { UpdateDicomSeryDto } from './dto/update-dicom-sery.dto';
import { DicomSeriesRepository } from './dicom-series.repository';
import { DicomStudiesRepository } from '../dicom-studies/dicom-studies.repository';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { DicomInstancesRepository } from '../dicom-instances/dicom-instances.repository';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { RepositoryPaginationDto } from '@backend/database';

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

  private getLastestDicomSeriesNumber = async (id: string) => {
    let seriesNumber = 1;
    const latestDicomSeries = await this.dicomSeriesRepository.findOne({
      where: { studyId: id },
      order: { seriesNumber: -1 },
    });

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
  ) => {
    if (!['add', 'subtract'].includes(mode)) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to update number of series for study: invalid mode',
        IMAGING_SERVICE
      );
    }

    const study = await this.dicomStudiesRepository.findOne(
      { where: { id } },
      [],
      entityManager
    );

    if (!study) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to update number of series for study: study not found',
        IMAGING_SERVICE
      );
    }
    const newTotal =
      mode === 'add'
        ? study.numberOfSeries + quantity
        : study.numberOfSeries - quantity;

    if (newTotal < 0) {
      throw ThrowMicroserviceException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
        IMAGING_SERVICE
      );
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
  ) => {
    const series = await this.dicomSeriesRepository.findOne(
      { where: { id } },
      [],
      entityManager
    );
    if (!series) {
      throw ThrowMicroserviceException(
        HttpStatus.NOT_FOUND,
        'Dicom series not found',
        IMAGING_SERVICE
      );
    }
    return series;
  };

  private checkDicomStudy = async (
    id: string,
    entityManager?: EntityManager
  ) => {
    const study = await this.dicomStudiesRepository.findOne(
      { where: { id } },
      [],
      entityManager
    );

    if (!study) {
      throw ThrowMicroserviceException(
        HttpStatus.BAD_REQUEST,
        'Failed to process dicom series: study not found',
        IMAGING_SERVICE
      );
    }

    return study;
  };

  create = async (createDicomSeryDto: CreateDicomSeryDto) => {
    //check study before creating series
    await this.checkDicomStudy(createDicomSeryDto.studyId);

    //update total series in the study
    await this.updateDicomStudyNumberOfSeries(
      createDicomSeryDto.studyId,
      1,
      'add'
    );

    //get latest seriesNumber
    const seriesNumber = await this.getLastestDicomSeriesNumber(
      createDicomSeryDto.studyId
    );

    return await this.dicomSeriesRepository.create({
      ...createDicomSeryDto,
      seriesNumber: seriesNumber,
      numberOfInstances: 0,
    });
  };

  findAll = async () => {
    return await this.dicomSeriesRepository.findAll({}, relation);
  };

  findOne = async (id: string) => {
    //check dicom series
    await this.checkDicomSeries(id);

    return await this.dicomSeriesRepository.findOne(
      { where: { id } },
      relation
    );
  };

  update = async (id: string, updateDicomSeryDto: UpdateDicomSeryDto) => {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const series = await this.checkDicomSeries(
          id,
          transactionalEntityManager
        );
        let updateData = updateDicomSeryDto;

        if (
          updateDicomSeryDto.studyId &&
          series.studyId !== updateDicomSeryDto.studyId
        ) {
          const newStudy = await this.checkDicomStudy(
            updateDicomSeryDto.studyId,
            transactionalEntityManager
          );

          // Update old study counts
          await this.updateDicomStudyNumberOfSeries(
            series.studyId,
            1,
            'subtract',
            transactionalEntityManager
          );

          // Update new study counts
          await this.updateDicomStudyNumberOfSeries(
            newStudy.id,
            1,
            'add',
            transactionalEntityManager
          );

          // Set series number based on new study's count
          updateData = {
            ...updateDicomSeryDto,
            seriesNumber: await this.getLastestDicomSeriesNumber(newStudy.id),
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

  remove = async (id: string) => {
    //check dicom series
    const series = await this.checkDicomSeries(id);

    //update number of series in instance
    await this.updateDicomStudyNumberOfSeries(series.studyId, 1, 'subtract');

    return await this.dicomSeriesRepository.softDelete(id, 'isDeleted');
  };

  findMany = async (paginationDto: RepositoryPaginationDto) => {
    return await this.dicomSeriesRepository.paginate(paginationDto);
  };

  findByReferenceId = async (
    id: string,
    type: 'study' | 'seriesInstanceUid' | 'order' | 'modality',
    paginationDto: RepositoryPaginationDto
  ) => {
    return await this.dicomSeriesRepository.findSeriesByReferenceId(id, type, {
      ...paginationDto,
      relation,
    });
  };
}
