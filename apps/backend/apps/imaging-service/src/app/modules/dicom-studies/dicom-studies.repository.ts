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

interface DicomStudiesStatsSummary {
  totalDicomStudies: number;
  totalScannedStudies: number;
  totalPendingApprovalStudies: number;
  totalApprovedStudies: number;
  totalTechnicianVerifiedStudies: number;
  totalResultPrintedStudies: number;
}

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

  createQueryBuilder(alias: string, entityManager?: EntityManager) {
    return this.getRepository(entityManager).createQueryBuilder(alias);
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
    const query = repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.imagingOrder', 'imagingOrder')
      .leftJoinAndSelect('imagingOrder.procedure', 'procedure')
      .leftJoinAndSelect('imagingOrder.imagingOrderForm', 'imagingOrderForm');

    let referenceField;
    switch (type) {
      case 'modality':
        referenceField = 'procedure.modalityId';
        break;
      case 'order':
        referenceField = 'entity.orderId';
        break;
      case 'patient':
        referenceField = 'entity.patientId';
        break;
      case 'verifyingRadiologist':
        referenceField = 'entity.verifyingRadiologistId';
        break;

      case 'performingTechnician':
        referenceField = 'entity.performingTechnicianId';
        break;

      case 'referringPhysician':
        referenceField = 'entity.referringPhysicianId';
        break;

      case 'studyInstanceUid':
        referenceField = 'entity.studyInstanceUid';
        break;

      default:
        throw ThrowMicroserviceException(
          HttpStatus.BAD_REQUEST,
          'Invalid type find by referenceId for Dicom Studies',
          IMAGING_SERVICE
        );
    }

    query.andWhere(`${referenceField} = :referenceId`, {
      referenceId: id,
    });

    if (search && searchField) {
      query.andWhere(`${searchField} LIKE :search`, {
        search: `%${search}%`,
      });
    }

    if (relation?.length) {
      relation.forEach((r) => {
        const parts = r.split('.');
        let parentAlias = 'entity';
        let currentPath = '';

        for (const part of parts) {
          currentPath = `${parentAlias}.${part}`;
          const alias = `${parentAlias}_${part}`;

          const alreadyJoined = query.expressionMap.joinAttributes.some(
            (join) => join.alias.name === alias
          );

          if (!alreadyJoined) {
            query.leftJoinAndSelect(currentPath, alias);
          }

          parentAlias = alias;
        }
      });
    }

    if (sortField && order) {
      query.orderBy(
        `entity.${sortField}`,
        order.toUpperCase() as 'ASC' | 'DESC'
      );
    }

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
    const qb = repository
      .createQueryBuilder('study')
      .leftJoinAndSelect('study.imagingOrder', 'order')
      .leftJoinAndSelect('order.imagingOrderForm', 'imagingOrderForm')
      .leftJoinAndSelect('study.modalityMachine', 'modality_machine')
      .leftJoinAndSelect(
        'modality_machine.modality',
        'modality_machine_modality'
      )
      .innerJoinAndSelect('study.series', 'series')
      .innerJoinAndSelect('series.instances', 'instance')
      .innerJoinAndSelect('order.procedure', 'procedure')
      .leftJoinAndSelect('procedure.modality', 'modality')
      .leftJoinAndSelect('procedure.bodyPart', 'bodyPart')
      .andWhere('study.isDeleted = :notDeleted', { notDeleted: false })
      .orderBy('study.createdAt', 'DESC');

    if (data.roomId) {
      qb.andWhere('imagingOrderForm.roomId = :roomId', { roomId: data.roomId });
    }

    if (data.studyUID)
      qb.andWhere('study.studyInstanceUid ILIKE :studyUID', {
        studyUID: `%${data.studyUID}%`,
      });

    if (data.startDate)
      qb.andWhere('study.studyDate >= :startDate', {
        startDate: new Date(data.startDate),
      });

    if (data.endDate)
      qb.andWhere('study.studyDate <= :endDate', {
        endDate: new Date(data.endDate),
      });

    if (data.bodyPart)
      qb.andWhere('bodyPart.name ILIKE :bodyPart', {
        bodyPart: `%${data.bodyPart}%`,
      });

    if (data.modalityId)
      qb.andWhere('modality.id = :modalityId', {
        modalityId: data.modalityId,
      });

    if (data.modalityMachineId)
      qb.andWhere('study.modalityMachineId = :modalityMachineId', {
        modalityMachineId: data.modalityMachineId,
      });

    if (data.studyStatus && data.studyStatus.toLocaleLowerCase() !== 'all')
      qb.andWhere('study.studyStatus = :studyStatus', {
        studyStatus: data.studyStatus,
      });

    if (data.role && data.role === Roles.RADIOLOGIST) {
      qb.andWhere('study.studyStatus <> :status', {
        status: DicomStudyStatus.SCANNED,
      }).andWhere('study.studyStatus <> :rejectedStatus', {
        rejectedStatus: DicomStudyStatus.REJECTED,
      });
    }

    return await qb.getMany();
  }

  async getStatsInDateRange(
    dateFrom?: string,
    dateTo?: string,
    roomId?: string,
    userInfo?: { userId: string; role: string }
  ): Promise<DicomStudiesStatsSummary> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('study')
      .select('COUNT(study.id)', 'totalStudies')
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :scannedStatus THEN 1 END)`,
        'totalScannedStudies'
      )
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :pendingApprovalStatus THEN 1 END)`,
        'totalPendingApprovalStudies'
      )
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :approvedStatus THEN 1 END)`,
        'totalApprovedStudies'
      )
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :technicianVerifiedStatus THEN 1 END)`,
        'totalTechnicianVerifiedStudies'
      )
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :resultPrintedStatus THEN 1 END)`,
        'totalResultPrintedStudies'
      )
      .leftJoin('study.imagingOrder', 'order')
      .leftJoin('order.imagingOrderForm', 'imagingOrderForm')
      .where('study.isDeleted = :isDeleted', { isDeleted: false })
      .setParameter('scannedStatus', DicomStudyStatus.SCANNED)
      .setParameter('pendingApprovalStatus', DicomStudyStatus.PENDING_APPROVAL)
      .setParameter('approvedStatus', DicomStudyStatus.APPROVED)
      .setParameter(
        'technicianVerifiedStatus',
        DicomStudyStatus.TECHNICIAN_VERIFIED
      )
      .setParameter('resultPrintedStatus', DicomStudyStatus.RESULT_PRINTED);

    if (dateFrom && dateTo) {
      queryBuilder
        .andWhere('study.studyDate >= :dateFrom', { dateFrom })
        .andWhere('study.studyDate <= :dateTo', { dateTo });
    } else if (dateFrom && !dateTo) {
      queryBuilder.andWhere('study.studyDate >= :dateFrom', {
        dateFrom,
      });
    } else if (!dateFrom && dateTo) {
      queryBuilder.andWhere('study.studyDate <= :dateTo', { dateTo });
    }
    if (roomId) {
      queryBuilder.andWhere('imagingOrderForm.roomId = :roomId', {
        roomId,
      });
    }

    if (userInfo && userInfo.role === Roles.PHYSICIAN) {
      queryBuilder.andWhere('imagingOrderForm.orderingPhysicianId = :userId', {
        userId: userInfo.userId,
      });
    }

    const result = await queryBuilder.getRawOne();

    if (!result) {
      return {
        totalDicomStudies: 0,
        totalScannedStudies: 0,
        totalPendingApprovalStudies: 0,
        totalApprovedStudies: 0,
        totalTechnicianVerifiedStudies: 0,
        totalResultPrintedStudies: 0,
      };
    }

    return {
      totalDicomStudies: parseInt(result?.totalStudies || '0', 10),
      totalScannedStudies: parseInt(result?.totalScannedStudies || '0', 10),
      totalPendingApprovalStudies: parseInt(
        result?.totalPendingApprovalStudies || '0',
        10
      ),
      totalApprovedStudies: parseInt(result?.totalApprovedStudies || '0', 10),
      totalTechnicianVerifiedStudies: parseInt(
        result?.totalTechnicianVerifiedStudies || '0',
        10
      ),
      totalResultPrintedStudies: parseInt(
        result?.totalResultPrintedStudies || '0',
        10
      ),
    };
  }

  async getTotalStats(
    roomId?: string,
    userInfo?: { userId: string; role: string }
  ): Promise<DicomStudiesStatsSummary> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('study')
      .select('COUNT(study.id)', 'totalStudies')
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :scannedStatus THEN 1 END)`,
        'totalScannedStudies'
      )
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :pendingApprovalStatus THEN 1 END)`,
        'totalPendingApprovalStudies'
      )
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :approvedStatus THEN 1 END)`,
        'totalApprovedStudies'
      )
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :technicianVerifiedStatus THEN 1 END)`,
        'totalTechnicianVerifiedStudies'
      )
      .addSelect(
        `COUNT(CASE WHEN study.study_status = :resultPrintedStatus THEN 1 END)`,
        'totalResultPrintedStudies'
      )
      .leftJoin('study.imagingOrder', 'order')
      .leftJoin('order.imagingOrderForm', 'imagingOrderForm')
      .where('study.isDeleted = :isDeleted', { isDeleted: false })
      .setParameter('scannedStatus', DicomStudyStatus.SCANNED)
      .setParameter('pendingApprovalStatus', DicomStudyStatus.PENDING_APPROVAL)
      .setParameter('approvedStatus', DicomStudyStatus.APPROVED)
      .setParameter(
        'technicianVerifiedStatus',
        DicomStudyStatus.TECHNICIAN_VERIFIED
      )
      .setParameter('resultPrintedStatus', DicomStudyStatus.RESULT_PRINTED);

    if (roomId) {
      queryBuilder.andWhere('imagingOrderForm.roomId = :roomId', {
        roomId,
      });
    }

    if (userInfo && userInfo.role === Roles.PHYSICIAN) {
      queryBuilder.andWhere('imagingOrderForm.orderingPhysicianId = :userId', {
        userId: userInfo.userId,
      });
    }

    const result = await queryBuilder.getRawOne();

    if (!result) {
      return {
        totalDicomStudies: 0,
        totalScannedStudies: 0,
        totalPendingApprovalStudies: 0,
        totalApprovedStudies: 0,
        totalTechnicianVerifiedStudies: 0,
        totalResultPrintedStudies: 0,
      };
    }

    return {
      totalDicomStudies: parseInt(result?.totalStudies || '0', 10),
      totalScannedStudies: parseInt(result?.totalScannedStudies || '0', 10),
      totalPendingApprovalStudies: parseInt(
        result?.totalPendingApprovalStudies || '0',
        10
      ),
      totalApprovedStudies: parseInt(result?.totalApprovedStudies || '0', 10),
      totalTechnicianVerifiedStudies: parseInt(
        result?.totalTechnicianVerifiedStudies || '0',
        10
      ),
      totalResultPrintedStudies: parseInt(
        result?.totalResultPrintedStudies || '0',
        10
      ),
    };
  }
}
