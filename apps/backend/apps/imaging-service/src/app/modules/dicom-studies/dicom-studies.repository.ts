import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BaseRepository,
  PaginatedResponseDto,
  RepositoryPaginationDto,
} from '@backend/database';
import { DicomStudy } from '@backend/shared-domain';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../../../constant/microservice.constant';
import { DicomStudyStatus, Roles } from '@backend/shared-enums';
import { FilterData } from './dicom-studies.controller';

export type findDicomStudyByReferenceIdType =
  | 'modality'
  | 'order'
  | 'patient'
  | 'performingTechnician'
  | 'verifyingRadiologist'
  | 'referringPhysician'
  | 'studyInstanceUid';
@Injectable()
export class DicomStudiesRepository extends BaseRepository<DicomStudy> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(DicomStudy, entityManager);
  }

  async findDicomStudiesByReferenceId(
    id: string,
    type: findDicomStudyByReferenceIdType,
    paginationDto: RepositoryPaginationDto,
    entityManager?: EntityManager
  ): Promise<PaginatedResponseDto<DicomStudy>> {
    const repository = this.getRepository(entityManager);
    const {
      page = 1,
      limit = 10,
      sortField,
      order,
      relation,
      searchField,
      search,
    } = paginationDto;

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const skip = (safePage - 1) * safeLimit;

    let referenceField;
    switch (type) {
      case 'modality':
        referenceField = 'modalityId';
        break;
      case 'order':
        referenceField = 'orderId';
        break;
      case 'patient':
        referenceField = 'patientId';
        break;
      case 'verifyingRadiologist':
        referenceField = 'verifyingRadiologistId';
        break;

      case 'performingTechnician':
        referenceField = 'performingTechnicianId';
        break;

      case 'referringPhysician':
        referenceField = 'referringPhysicianId';
        break;

      case 'studyInstanceUid':
        referenceField = 'studyInstanceUid';
        break;

      default:
        throw ThrowMicroserviceException(
          HttpStatus.BAD_REQUEST,
          'Invalid type find by referenceId for ImagingOrder',
          IMAGING_SERVICE
        );
    }

    const query = repository.createQueryBuilder('entity');

    query.andWhere(`entity.${referenceField} = :referenceId`, {
      referenceId: id,
    });

    //  Search filter
    if (search && searchField) {
      query.andWhere(`entity.${searchField} LIKE :search`, {
        search: `%${search}%`,
      });
    }

    //  Relations
    if (relation?.length) {
      relation.forEach((r) => query.leftJoinAndSelect(`entity.${r}`, r));
    }

    // Sorting
    if (sortField && order) {
      query.orderBy(
        `entity.${sortField}`,
        order.toUpperCase() as 'ASC' | 'DESC'
      );
    }

    //  Exclude soft-deleted
    if (this.hasIsDeletedColumn()) {
      query.andWhere('entity.isDeleted = :isDeleted', { isDeleted: false });
    }

    query.skip(skip).take(safeLimit);

    const [data, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total / safeLimit);
    const hasNextPage = safePage < totalPages;
    const hasPreviousPage = safePage > 1;

    return new PaginatedResponseDto<DicomStudy>(
      data,
      total,
      safePage,
      safeLimit,
      totalPages,
      hasNextPage,
      hasPreviousPage
    );
  }

  async filter(data: FilterData): Promise<DicomStudy[]> {
    const repository = this.getRepository();
    const qb = await repository
      .createQueryBuilder('study')
      .leftJoinAndSelect('study.imagingOrder', 'order')
      .leftJoinAndSelect('order.modality', 'modality')
      .leftJoinAndSelect('study.modalityMachine', 'modality_machine')
      .innerJoinAndSelect('study.series', 'series')
      .innerJoinAndSelect('series.instances', 'instance')
      .innerJoinAndSelect('order.procedure', 'procedure')
      .leftJoinAndSelect('procedure.bodyPart', 'bodyPart')
      .andWhere('study.isDeleted = :notDeleted', { notDeleted: false });
    if (data.studyUID)
      qb.andWhere('study.study_instance_uid ILIKE :studyUID', {
        studyUID: `%${data.studyUID}%`,
      });
    if (data.startDate)
      qb.andWhere('study.study_date >= :startDate', {
        startDate: new Date(data.startDate),
      });
    if (data.endDate)
      qb.andWhere('study.study_date <= :endDate', {
        endDate: new Date(data.endDate),
      });

    if (data.bodyPart)
      qb.andWhere('bodyPart.name ILIKE :bodyPart', {
        bodyPart: `%${data.bodyPart}%`,
      });

    if (data.modalityId)
      qb.andWhere('modality.modality_id = :modalityId', {
        modalityId: `${data.modalityId}`,
      });

    if (data.modalityMachineId)
      qb.andWhere('study.modality_machine_id = :modalityMachineId', {
        modalityMachineId: data.modalityMachineId,
      });

    if (data.studyStatus && data.studyStatus.toLocaleLowerCase() !== 'all')
      qb.andWhere('study.study_status = :studyStatus', {
        studyStatus: data.studyStatus,
      });

    //radiologist can only see technician verified status study
    if (data.role && data.role === Roles.RADIOLOGIST) {
      qb.andWhere('study.study_status <> :status', {
        status: DicomStudyStatus.SCANNED,
      });
    }

    return await qb.getMany();
  }
}
