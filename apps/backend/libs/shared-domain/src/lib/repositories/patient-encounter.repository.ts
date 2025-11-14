import { Injectable } from '@nestjs/common';
import { Between, EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RepositoryPaginationDto } from '@backend/database';
import { PatientEncounter } from '../entities/patients/patient-encounters.entity';
import { Patient } from '../entities/patients/patients.entity';
import { DiagnosesReport } from '../entities/patients/diagnoses-reports.entity';
import {
  EncounterPriorityLevel,
  EncounterStatus,
  EncounterType,
} from '@backend/shared-enums';
import type { VitalSignsCollection } from '@backend/shared-interfaces';

export interface QueueInfo {
  [roomId: string]: {
    maxWaiting: { queueNumber: number; entity?: PatientEncounter } | null;
    currentInProgress: {
      queueNumber: number;
      entity?: PatientEncounter;
    } | null;
  };
}

export interface RoomEncounterFilters {
  roomId: string;
  serviceRoomIds: string[];
}

export interface EncounterSearchFilters {
  patientId?: string;
  encounterType?: EncounterType;
  encounterDateFrom?: Date;
  encounterDateTo?: Date;
  assignedPhysicianId?: string;
  chiefComplaint?: string;
  limit?: number;
  offset?: number;
}

export interface EncounterWithDetails {
  id: string;
  patientId: string;
  encounterDate: Date;
  encounterType: EncounterType;
  chiefComplaint?: string;
  symptoms?: string;
  vitalSigns?: VitalSignsCollection;
  assignedPhysicianId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  patient?: Patient;
  diagnoses?: DiagnosesReport[];
  diagnosesCount?: number;
}

export interface PaginatedEncounter {
  encounters: PatientEncounter[];
  total: number;
  page: number;
  totalPages: number;
}
@Injectable()
export class PatientEncounterRepository extends BaseRepository<PatientEncounter> {
  constructor(entityManager: EntityManager) {
    super(PatientEncounter, entityManager);
  }

  /**
   * Find encounter by ID with relations
   */
  async findByIdWithRelations(id: string): Promise<PatientEncounter | null> {
    return await this.findOne({ where: { id } }, ['patient']);
  }

  /**
   * Find encounters by patient ID
   */
  async findByPatientId(
    patientId: string,
    limit?: number
  ): Promise<PatientEncounter[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.patientId = :patientId', { patientId })
      .andWhere('encounter.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('encounter.encounterDate', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }

  /**
   * Find all encounters with optional filters
   */
  async findAllWithFilters(
    filters: EncounterSearchFilters = {}
  ): Promise<PatientEncounter[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.patientId) {
      queryBuilder.andWhere('encounter.patientId = :patientId', {
        patientId: filters.patientId,
      });
    }

    if (filters.encounterType) {
      queryBuilder.andWhere('encounter.encounterType = :encounterType', {
        encounterType: filters.encounterType,
      });
    }

    if (filters.encounterDateFrom) {
      queryBuilder.andWhere('encounter.encounterDate >= :encounterDateFrom', {
        encounterDateFrom: filters.encounterDateFrom,
      });
    }

    if (filters.encounterDateTo) {
      queryBuilder.andWhere('encounter.encounterDate <= :encounterDateTo', {
        encounterDateTo: filters.encounterDateTo,
      });
    }

    if (filters.assignedPhysicianId) {
      queryBuilder.andWhere(
        'encounter.assignedPhysicianId = :assignedPhysicianId',
        {
          assignedPhysicianId: filters.assignedPhysicianId,
        }
      );
    }

    if (filters.chiefComplaint) {
      queryBuilder.andWhere('encounter.chiefComplaint ILIKE :chiefComplaint', {
        chiefComplaint: `%${filters.chiefComplaint}%`,
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('encounter.encounterDate', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Find encounters with pagination using BaseRepository paginate method
   */
  async findWithPagination(
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedEncounter> {
    // Set default relations for encounter queries
    const paginationWithRelations = {
      ...paginationDto,
      relation: paginationDto.relation || ['patient'],
    };

    const result = await this.paginate(paginationWithRelations);

    return {
      encounters: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  /**
   * Soft delete encounter by ID
   */
  async softDeleteEncounter(id: string): Promise<boolean> {
    const result = await this.getRepository().update(id, { isDeleted: true });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Restore soft-deleted encounter
   */
  async restoreEncounter(id: string): Promise<boolean> {
    const result = await this.getRepository().update(id, { isDeleted: false });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Get encounter with detailed information including diagnoses
   */
  async findEncounterWithDetails(
    id: string
  ): Promise<EncounterWithDetails | null> {
    const encounter = await this.findOne({ where: { id } }, ['patient']);

    if (!encounter) {
      return null;
    }

    // Get diagnoses for this encounter
    const diagnoses = await this.getRepository().manager.find(DiagnosesReport, {
      where: { encounterId: id, isDeleted: false },
      order: { diagnosisDate: 'DESC' },
    });

    return {
      ...encounter,
      diagnoses,
      diagnosesCount: diagnoses.length,
    } as EncounterWithDetails;
  }

  /**
   * Get encounters by physician ID
   */
  async findByPhysicianId(
    physicianId: string,
    limit?: number
  ): Promise<PatientEncounter[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.assignedPhysicianId = :physicianId', { physicianId })
      .andWhere('encounter.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('encounter.encounterDate', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get encounter statistics
   */
  async getEncounterStats(patientId?: string): Promise<{
    totalEncounters: number;
    encountersByType: Record<string, number>;
    encountersThisMonth: number;
    averageEncountersPerPatient: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const whereClause = patientId
      ? { patientId, isDeleted: false }
      : { isDeleted: false };

    const [totalEncounters, encountersThisMonth, allEncounters] =
      await Promise.all([
        this.getRepository().count({ where: whereClause }),
        this.getRepository().count({
          where: {
            ...whereClause,
            encounterDate: Between(startOfMonth, now),
          },
        }),
        this.getRepository().find({
          where: whereClause,
          select: ['encounterType'],
        }),
      ]);

    // Count encounters by type
    const encountersByType = allEncounters.reduce((acc, encounter) => {
      const type = encounter.encounterType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average encounters per patient
    const uniquePatients = new Set(allEncounters.map((e) => e.patientId)).size;
    const averageEncountersPerPatient =
      uniquePatients > 0 ? totalEncounters / uniquePatients : 0;

    return {
      totalEncounters,
      encountersByType,
      encountersThisMonth,
      averageEncountersPerPatient,
    };
  }

  /**
   * Get recent encounters for a patient
   */
  async getRecentEncounters(
    patientId: string,
    limit: number = 5
  ): Promise<PatientEncounter[]> {
    return await this.findAll(
      { where: { patientId }, take: limit, order: { encounterDate: 'DESC' } },
      ['patient']
    );
  }

  async getStatsInDateRange(
    dateFrom: string,
    dateTo: string,
    serviceRoomIds?: string[]
  ): Promise<any> {
    const startDate = new Date(dateFrom + 'T00:00:00');
    const endDate = new Date(dateTo + 'T23:59:59.999');
    const queryBuilder = this.getRepository()
      .createQueryBuilder('encounter')
      .select('COUNT(*)', 'totalEncounters')
      .addSelect(
        `COUNT(CASE WHEN encounter.status = :finishedStatus THEN 1 END)`,
        'totalCompletedEncounters'
      )
      .addSelect(
        `COUNT(CASE WHEN encounter.status = :arrivedStatus THEN 1 END)`,
        'totalArrivedEncounters'
      )

      .where('encounter.encounter_date >= :dateFrom', {
        dateFrom: startDate,
      })
      .andWhere('encounter.encounter_date <= :dateTo', {
        dateTo: endDate,
      })
      .andWhere('encounter.is_deleted = :isDeleted', { isDeleted: false })
      .setParameter('finishedStatus', EncounterStatus.FINISHED)
      .setParameter('arrivedStatus', EncounterStatus.ARRIVED);

    if (serviceRoomIds && serviceRoomIds.length > 0) {
      queryBuilder.andWhere(
        'encounter.service_room_id IN (:...serviceRoomIds)',
        {
          serviceRoomIds,
        }
      );
    }

    console.log('🔍 SQL:', queryBuilder.getSql());
    console.log('🔍 Params:', queryBuilder.getParameters());

    const result = await queryBuilder.getRawOne();

    return {
      totalEncounters: parseInt(result?.totalEncounters || '0', 10),
      totalCompletedEncounters: parseInt(
        result?.totalCompletedEncounters || '0',
        10
      ),
      totalArrivedEncounters: parseInt(
        result?.totalArrivedEncounters || '0',
        10
      ),
    };
  }
  // async findInRoomWithFilters(filters: {
  //   page: number;
  //   limit: number;
  //   fromDate: Date;
  //   toDate: Date;
  //   status?: EncounterStatus;
  //   priority?: EncounterPriorityLevel;
  //   orderNumber?: number;
  //   patientName?: string;
  //   serviceRoomIds?: string[];
  // }): Promise<{ data: PatientEncounter[]; total: number }> {
  //   const {
  //     page,
  //     limit,
  //     fromDate,
  //     toDate,
  //     status,
  //     priority,
  //     orderNumber,
  //     patientName,
  //     serviceRoomIds,
  //   } = filters;

  async getLatestEncounterInDate(
    servicesRoomIds: string[]
  ): Promise<PatientEncounter | null> {
    const repository = this.getRepository();

    const startOfDate = new Date();
    startOfDate.setHours(0, 0, 0, 0);

    const endOfDate = new Date();
    endOfDate.setHours(23, 59, 59, 999);

    const qb = repository
      .createQueryBuilder('encounter')
      .where('encounter.serviceRoomId IN (:...servicesRoomIds)', {
        servicesRoomIds,
      })
      .andWhere('encounter.created_at BETWEEN :startOfDate AND :endOfDate', {
        startOfDate: startOfDate.toISOString(),
        endOfDate: endOfDate.toISOString(),
      })
      .orderBy('encounter.order_number', 'DESC')
      .limit(1);

    return qb.getOne();
  }

  // async findInRoomWithFilters(filters: {
  //   page: number;
  //   limit: number;
  //   fromDate: Date;
  //   toDate: Date;
  //   status?: EncounterStatus;
  //   priority?: EncounterPriorityLevel;
  //   orderNumber?: number;
  //   patientName?: string;
  //   serviceRoomIds?: string[];
  // }): Promise<{ data: PatientEncounter[]; total: number }> {
  //   const {
  //     page,
  //     limit,
  //     fromDate,
  //     toDate,
  //     status,
  //     priority,
  //     orderNumber,
  //     patientName,
  //     serviceRoomIds,
  //   } = filters;

  //   const queryBuilder = this.getRepository()
  //     .createQueryBuilder('encounter')
  //     .leftJoinAndSelect('encounter.patient', 'patient');

  //   // ✅ Apply filters
  //   queryBuilder.andWhere(
  //     'encounter.encounter_date BETWEEN :fromDate AND :toDate',
  //     { fromDate, toDate }
  //   );

  //   if (status) {
  //     queryBuilder.andWhere('encounter.status = :status', { status });
  //   }

  //   if (priority) {
  //     queryBuilder.andWhere('encounter.priority = :priority', { priority });
  //   }

  //   if (orderNumber) {
  //     queryBuilder.andWhere('encounter.order_number = :orderNumber', {
  //       orderNumber,
  //     });
  //   }

  //   if (patientName) {
  //     queryBuilder.andWhere(
  //       `(patient.first_name || ' ' || patient.last_name) ILIKE :patientName`,
  //       { patientName: `%${patientName}%` }
  //     );
  //   }

  //   if (serviceRoomIds && serviceRoomIds.length > 0) {
  //     queryBuilder.andWhere(
  //       'encounter.service_room_id IN (:...serviceRoomIds)',
  //       { serviceRoomIds }
  //     );
  //   }

  //   queryBuilder.andWhere('encounter.is_deleted = :isDeleted', {
  //     isDeleted: false,
  //   });

  //   queryBuilder
  //     .addSelect(
  //       `CASE
  //         WHEN encounter.status = '${EncounterStatus.ARRIVED}' THEN 0
  //         WHEN encounter.status = '${EncounterStatus.WAITING}' THEN 1
  //         WHEN encounter.status = '${EncounterStatus.FINISHED}' THEN 3
  //         ELSE 2
  //       END`,
  //       'status_priority'
  //     )
  //     .addSelect(
  //       `CASE
  //         WHEN encounter.status = '${EncounterStatus.WAITING}' AND encounter.skipped_at IS NOT NULL THEN 1
  //         ELSE 0
  //       END`,
  //       'is_skipped'
  //     )
  //     .addSelect(
  //       `CASE
  //         WHEN encounter.priority = '${EncounterPriorityLevel.STAT}' THEN 0
  //         WHEN encounter.priority = '${EncounterPriorityLevel.URGENT}' THEN 1
  //         WHEN encounter.priority = '${EncounterPriorityLevel.ROUTINE}' THEN 2
  //         ELSE 3
  //       END`,
  //       'priority_value'
  //     );

  //   queryBuilder
  //     .orderBy('status_priority', 'ASC')
  //     .addOrderBy('is_skipped', 'ASC')
  //     .addOrderBy('priority_value', 'ASC')
  //     .addOrderBy('encounter.order_number', 'ASC');

  //   const skip = (page - 1) * limit;
  //   queryBuilder.skip(skip).take(limit);

  //   const total = await queryBuilder.getCount();
  //   const data = await queryBuilder.getMany();

  //   return { data, total };
  // }

  async getEncounterStatsByServiceRoomIdsInDate(
    serviceRoomIds: string[]
  ): Promise<PatientEncounter[]> {
    const startOfDate = new Date();
    startOfDate.setHours(0, 0, 0, 0);

    const endOfDate = new Date();
    endOfDate.setHours(23, 59, 59, 999);

    const repository = await this.getRepository();

    const qb = repository
      .createQueryBuilder('encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.service_room_id IN (:...serviceRoomIds)', {
        serviceRoomIds,
      })
      .andWhere('encounter.createdAt BETWEEN :startOfDate AND :endOfDate', {
        startOfDate,
        endOfDate,
      });

    return qb.getMany();
  }
}
