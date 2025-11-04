import { Injectable } from '@nestjs/common';
import { Between, EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RepositoryPaginationDto } from '@backend/database';
import { PatientEncounter } from '../entities/patients/patient-encounters.entity';
import { Patient } from '../entities/patients/patients.entity';
import { DiagnosesReport } from '../entities/patients/diagnoses-reports.entity';
import { EncounterType } from '@backend/shared-enums';
import type { VitalSignsCollection } from '@backend/shared-interfaces';

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
}
