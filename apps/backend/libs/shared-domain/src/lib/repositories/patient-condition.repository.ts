import { Injectable } from '@nestjs/common';
import { Between, EntityManager } from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RepositoryPaginationDto } from '@backend/database';
import { PatientCondition } from '../entities/patients/patient-conditions.entity';

export interface PatientConditionSearchFilters {
  patientId?: string;
  code?: string;
  codeSystem?: string;
  clinicalStatus?: string;
  verificationStatus?: string;
  severity?: string;
  recordedDateFrom?: Date;
  recordedDateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface ConditionWithDetails {
  id: string;
  patientId: string;
  code: string;
  codeSystem?: string;
  codeDisplay?: string;
  clinicalStatus?: string;
  verificationStatus?: string;
  severity?: string;
  stageSummary?: string;
  bodySite?: string;
  recordedDate: Date;
  notes?: string;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  patient?: any;
}

export interface PaginatedCondition {
  conditions: PatientCondition[];
  total: number;
  page: number;
  totalPages: number;
}
@Injectable()
export class PatientConditionRepository extends BaseRepository<PatientCondition> {
  constructor(entityManager: EntityManager) {
    super(PatientCondition, entityManager);
  }

  /**
   * Find condition by ID with relations
   */
  async findByIdWithRelations(id: string): Promise<PatientCondition | null> {
    return await this.findOne({ where: { id } }, ['patient']);
  }

  /**
   * Find conditions by patient ID
   */
  async findByPatientId(
    patientId: string,
    limit?: number
  ): Promise<PatientCondition[]> {
    return await this.findAll(
      {
        where: { patientId },
        order: { recordedDate: 'DESC' },
        take: limit,
      },
      ['patient']
    );
  }

  /**
   * Find all conditions with optional filters
   */
  async findAllWithFilters(
    filters: PatientConditionSearchFilters = {}
  ): Promise<PatientCondition[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('condition')
      .leftJoinAndSelect('condition.patient', 'patient')
      .where('condition.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.patientId) {
      queryBuilder.andWhere('condition.patientId = :patientId', {
        patientId: filters.patientId,
      });
    }

    if (filters.code) {
      queryBuilder.andWhere('condition.code = :code', {
        code: filters.code,
      });
    }

    if (filters.codeSystem) {
      queryBuilder.andWhere('condition.codeSystem = :codeSystem', {
        codeSystem: filters.codeSystem,
      });
    }

    if (filters.clinicalStatus) {
      queryBuilder.andWhere('condition.clinicalStatus = :clinicalStatus', {
        clinicalStatus: filters.clinicalStatus,
      });
    }

    if (filters.verificationStatus) {
      queryBuilder.andWhere(
        'condition.verificationStatus = :verificationStatus',
        {
          verificationStatus: filters.verificationStatus,
        }
      );
    }

    if (filters.severity) {
      queryBuilder.andWhere('condition.severity = :severity', {
        severity: filters.severity,
      });
    }

    if (filters.recordedDateFrom) {
      queryBuilder.andWhere('condition.recordedDate >= :recordedDateFrom', {
        recordedDateFrom: filters.recordedDateFrom,
      });
    }

    if (filters.recordedDateTo) {
      queryBuilder.andWhere('condition.recordedDate <= :recordedDateTo', {
        recordedDateTo: filters.recordedDateTo,
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('condition.recordedDate', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Find conditions with pagination using BaseRepository paginate method
   */
  async findWithPagination(
    paginationDto: RepositoryPaginationDto
  ): Promise<PaginatedCondition> {
    // Set default relations for condition queries
    const paginationWithRelations = {
      ...paginationDto,
      relation: paginationDto.relation || ['patient'],
    };

    const result = await this.paginate(paginationWithRelations);

    return {
      conditions: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  /**
   * Soft delete condition by ID
   */
  async softDeleteCondition(id: string): Promise<boolean> {
    const result = await this.getRepository().update(id, { isDeleted: true });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Restore soft-deleted condition
   */
  async restoreCondition(id: string): Promise<boolean> {
    const result = await this.getRepository().update(id, { isDeleted: false });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Get condition with detailed information
   */
  async findConditionWithDetails(
    id: string
  ): Promise<ConditionWithDetails | null> {
    const condition = await this.findOne({ where: { id } }, ['patient']);

    if (!condition) {
      return null;
    }

    return {
      ...condition,
      patient: condition.patient,
    } as ConditionWithDetails;
  }

  /**
   * Get conditions by code
   */
  async findByCode(code: string, limit?: number): Promise<PatientCondition[]> {
    const queryBuilder = this.getRepository()
      .createQueryBuilder('condition')
      .leftJoinAndSelect('condition.patient', 'patient')
      .where('condition.code = :code', { code })
      .andWhere('condition.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('condition.recordedDate', 'DESC');

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get condition statistics
   */
  async getConditionStats(patientId?: string): Promise<{
    totalConditions: number;
    conditionsByCode: Record<string, number>;
    conditionsBySeverity: Record<string, number>;
    conditionsByClinicalStatus: Record<string, number>;
    conditionsThisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const whereClause = patientId
      ? { patientId, isDeleted: false }
      : { isDeleted: false };

    const [totalConditions, conditionsThisMonth, allConditions] =
      await Promise.all([
        this.getRepository().count({ where: whereClause }),
        this.getRepository().count({
          where: {
            ...whereClause,
            recordedDate: Between(startOfMonth, now),
          },
        }),
        this.getRepository().find({
          where: whereClause,
          select: ['code', 'severity', 'clinicalStatus'],
        }),
      ]);

    // Count conditions by code
    const conditionsByCode = allConditions.reduce((acc, condition) => {
      const code = condition.code;
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count conditions by severity
    const conditionsBySeverity = allConditions.reduce((acc, condition) => {
      const severity = condition.severity || 'UNKNOWN';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count conditions by clinical status
    const conditionsByClinicalStatus = allConditions.reduce(
      (acc, condition) => {
        const status = condition.clinicalStatus || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalConditions,
      conditionsByCode,
      conditionsBySeverity,
      conditionsByClinicalStatus,
      conditionsThisMonth,
    };
  }

  /**
   * Get recent conditions for a patient
   */
  async getRecentConditions(
    patientId: string,
    limit: number = 5
  ): Promise<PatientCondition[]> {
    return await this.findAll(
      {
        where: { patientId },
        take: limit,
        order: { recordedDate: 'DESC' },
      },
      ['patient']
    );
  }
}
