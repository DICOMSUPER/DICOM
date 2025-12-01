import { Injectable } from '@nestjs/common';
import { Between, EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RepositoryPaginationDto } from '@backend/database';
import { DiagnosesReport } from '../entities/patients/diagnoses-reports.entity';
import { PatientEncounter } from '../entities/patients/patient-encounters.entity';
import { Patient } from '../entities/patients/patients.entity';
import {
  DiagnosisType,
  DiagnosisStatus,
  Severity,
} from '@backend/shared-enums';

export interface DiagnosisSearchFilters {
  encounterId?: string;
  patientId?: string;
  diagnosisType?: DiagnosisType;
  diagnosisStatus?: DiagnosisStatus;
  severity?: Severity;
  diagnosedBy?: string;
  diagnosisDateFrom?: Date;
  diagnosisDateTo?: Date;
  diagnosisName?: string;
  limit?: number;
  offset?: number;
}

export interface DiagnosisWithDetails {
  id: string;
  encounterId: string;
  studyId: string;
  diagnosisName: string;
  description?: string;
  diagnosisType: DiagnosisType;
  diagnosisStatus: DiagnosisStatus;
  severity?: Severity;
  diagnosisDate: Date;
  diagnosedBy: string;
  notes?: string;
  followUpInstructions: boolean;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  encounter?: PatientEncounter;
  patient?: Patient;
}

@Injectable()
export class DiagnosisReportRepository extends BaseRepository<DiagnosesReport> {
  constructor(entityManager: EntityManager) {
    super(DiagnosesReport, entityManager);
  }

  /**
   * Find diagnosis by ID with relations
   */
  async findByIdWithRelations(id: string): Promise<DiagnosesReport | null> {
    return await this.findOne({ where: { id } }, [
      'encounter',
      'encounter.patient',
    ]);
  }

  /**
   * Find diagnoses by encounter ID
   */
  async findByEncounterId(encounterId: string): Promise<DiagnosesReport[]> {
    return await this.findAll(
      { where: { encounterId }, order: { diagnosisDate: 'DESC' } },
      ['encounter']
    );
  }

  /**
   * Find diagnoses by patient ID
   */
  async findByPatientId(
    patientId: string,
    limit?: number
  ): Promise<DiagnosesReport[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.patientId = :patientId', { patientId })
      .andWhere('diagnosis.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('diagnosis.diagnosisDate', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }

  /**
   * Find all diagnoses with optional filters
   */
  async findAllWithFilters(
    filters: DiagnosisSearchFilters = {}
  ): Promise<DiagnosesReport[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('diagnosis.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.encounterId) {
      queryBuilder.andWhere('diagnosis.encounterId = :encounterId', {
        encounterId: filters.encounterId,
      });
    }

    if (filters.patientId) {
      queryBuilder.andWhere('encounter.patientId = :patientId', {
        patientId: filters.patientId,
      });
    }

    if (filters.diagnosisType) {
      queryBuilder.andWhere('diagnosis.diagnosisType = :diagnosisType', {
        diagnosisType: filters.diagnosisType,
      });
    }

    if (filters.diagnosisStatus) {
      queryBuilder.andWhere('diagnosis.diagnosisStatus = :diagnosisStatus', {
        diagnosisStatus: filters.diagnosisStatus,
      });
    }

    if (filters.severity) {
      queryBuilder.andWhere('diagnosis.severity = :severity', {
        severity: filters.severity,
      });
    }

    if (filters.diagnosedBy) {
      queryBuilder.andWhere('diagnosis.diagnosedBy = :diagnosedBy', {
        diagnosedBy: filters.diagnosedBy,
      });
    }

    if (filters.diagnosisDateFrom) {
      queryBuilder.andWhere('diagnosis.diagnosisDate >= :diagnosisDateFrom', {
        diagnosisDateFrom: filters.diagnosisDateFrom,
      });
    }

    if (filters.diagnosisDateTo) {
      queryBuilder.andWhere('diagnosis.diagnosisDate <= :diagnosisDateTo', {
        diagnosisDateTo: filters.diagnosisDateTo,
      });
    }

    if (filters.diagnosisName) {
      queryBuilder.andWhere('diagnosis.diagnosisName ILIKE :diagnosisName', {
        diagnosisName: `%${filters.diagnosisName}%`,
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('diagnosis.diagnosisDate', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Find diagnoses with pagination using BaseRepository paginate method
   */
  async findWithPagination(paginationDto: RepositoryPaginationDto): Promise<{
    diagnoses: DiagnosesReport[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Set default relations for diagnosis queries
    const paginationWithRelations = {
      ...paginationDto,
      relation: paginationDto.relation || ['encounter', 'encounter.patient'],
    };

    const result = await this.paginate(paginationWithRelations);

    return {
      diagnoses: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  /**
   * Soft delete diagnosis by ID
   */
  async softDeleteDiagnosis(id: string): Promise<boolean> {
    const result = await this.getRepository().update(id, { isDeleted: true });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Restore soft-deleted diagnosis
   */
  async restoreDiagnosis(id: string): Promise<boolean> {
    const result = await this.getRepository().update(id, { isDeleted: false });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Get diagnosis with detailed information
   */
  async findDiagnosisWithDetails(
    id: string
  ): Promise<DiagnosisWithDetails | null> {
    const diagnosis = await this.findOne({ where: { id } }, [
      'encounter',
      'encounter.patient',
    ]);

    if (!diagnosis) {
      return null;
    }

    return {
      ...diagnosis,
      patient: diagnosis.encounter?.patient,
    } as DiagnosisWithDetails;
  }

  /**
   * Get diagnoses by physician ID
   */
  async findByPhysicianId(
    physicianId: string,
    limit?: number
  ): Promise<DiagnosesReport[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('diagnosis.diagnosedBy = :physicianId', { physicianId })
      .andWhere('diagnosis.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('diagnosis.diagnosisDate', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get diagnosis statistics
   */
  async getDiagnosisStats(patientId?: string): Promise<{
    totalDiagnoses: number;
    diagnosesByType: Record<string, number>;
    diagnosesByStatus: Record<string, number>;
    diagnosesBySeverity: Record<string, number>;
    diagnosesThisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const whereClause = patientId
      ? { encounter: { patientId }, isDeleted: false }
      : { isDeleted: false };

    const [totalDiagnoses, diagnosesThisMonth, allDiagnoses] =
      await Promise.all([
        this.getRepository().count({ where: whereClause }),
        this.getRepository().count({
          where: {
            ...whereClause,
            diagnosisDate: Between(startOfMonth, now),
          },
        }),
        this.getRepository().find({
          where: whereClause,
          select: ['diagnosisType', 'diagnosisStatus', 'severity'],
        }),
      ]);

    // Count diagnoses by type
    const diagnosesByType = allDiagnoses.reduce((acc, diagnosis) => {
      const type = diagnosis.diagnosisType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count diagnoses by status
    const diagnosesByStatus = allDiagnoses.reduce((acc, diagnosis) => {
      const status = diagnosis.diagnosisStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count diagnoses by severity
    const diagnosesBySeverity = allDiagnoses.reduce((acc, diagnosis) => {
      const severity = diagnosis.severity || 'UNKNOWN';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDiagnoses,
      diagnosesByType,
      diagnosesByStatus,
      diagnosesBySeverity,
      diagnosesThisMonth,
    };
  }

  /**
   * Get diagnoses requiring follow-up
   */
  async getFollowupRequired(limit?: number): Promise<DiagnosesReport[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('diagnosis.followUpInstructions = :followUpInstructions', {
        followUpInstructions: true,
      })
      .andWhere('diagnosis.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('diagnosis.diagnosisDate', 'ASC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get recent diagnoses for a patient
   */
  async getRecentDiagnoses(
    patientId: string,
    limit: number = 10
  ): Promise<DiagnosesReport[]> {
    return await this.getRepository()
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .where('encounter.patientId = :patientId', { patientId })
      .andWhere('diagnosis.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('diagnosis.diagnosisDate', 'DESC')
      .limit(limit)
      .getMany();
  }

  async filter(
    studyIds: string[],
    reportStatus?: DiagnosisStatus | string
  ): Promise<DiagnosesReport[]> {
    const qb = this.getRepository().createQueryBuilder('report');

    if (studyIds.length > 0) {
      qb.andWhere('report.studyId IN (:...studyIds)', { studyIds });
    } else return [];

    if (reportStatus && reportStatus.toLocaleLowerCase() !== 'all')
      qb.andWhere('report.diagnosisStatus = :reportStatus', {
        reportStatus,
      });

    return qb.getMany();
  }

  async getStats(
    userInfo?: { userId: string; role: string }
  ): Promise<{
    total: number;
    active: number;
    resolved: number;
    critical: number;
    today: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const queryBuilder = this.getRepository()
        .createQueryBuilder('report')
        .select('COUNT(report.id)', 'total')
        .addSelect(
          `COUNT(CASE WHEN report.diagnosis_status = :activeStatus THEN 1 END)`,
          'active'
        )
        .addSelect(
          `COUNT(CASE WHEN report.diagnosis_status = :resolvedStatus THEN 1 END)`,
          'resolved'
        )
        .addSelect(
          `COUNT(CASE WHEN report.severity = :criticalSeverity THEN 1 END)`,
          'critical'
        )
        .addSelect(
          `COUNT(CASE WHEN report.diagnosis_date >= :todayStart AND report.diagnosis_date < :todayEnd THEN 1 END)`,
          'today'
        )
        .leftJoin('report.encounter', 'encounter')
        .where('report.is_deleted = :isDeleted', { isDeleted: false })
        .setParameter('activeStatus', DiagnosisStatus.ACTIVE)
        .setParameter('resolvedStatus', DiagnosisStatus.RESOLVED)
        .setParameter('criticalSeverity', 'critical')
        .setParameter('todayStart', today)
        .setParameter('todayEnd', tomorrow);

      if (userInfo && userInfo.role === 'physician') {
        queryBuilder.andWhere('encounter.assigned_physician_id = :userId', {
          userId: userInfo.userId,
        });
      }

      const result = await queryBuilder.getRawOne();

      if (!result) {
        return {
          total: 0,
          active: 0,
          resolved: 0,
          critical: 0,
          today: 0,
        };
      }

      return {
        total: parseInt(result?.total || '0', 10),
        active: parseInt(result?.active || '0', 10),
        resolved: parseInt(result?.resolved || '0', 10),
        critical: parseInt(result?.critical || '0', 10),
        today: parseInt(result?.today || '0', 10),
      };
    } catch (error) {
      return {
        total: 0,
        active: 0,
        resolved: 0,
        critical: 0,
        today: 0,
      };
    }
  }

}
