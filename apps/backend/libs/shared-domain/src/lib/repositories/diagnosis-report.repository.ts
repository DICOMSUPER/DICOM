import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { DiagnosesReport } from '../entities/patients/diagnoses-reports.entity';
import { PatientEncounter } from '../entities/patients/patient-encounters.entity';
import { Patient } from '../entities/patients/patients.entity';
import { DiagnosisType, DiagnosisStatus, Severity } from '@backend/shared-enums';

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
  followupRequired?: boolean;
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
  followupRequired: boolean;
  followUpInstructions: boolean;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  encounter?: PatientEncounter;
  patient?: Patient;
}

@Injectable()
export class DiagnosisReportRepository {
  constructor(
    @InjectRepository(DiagnosesReport)
    private readonly diagnosisRepository: Repository<DiagnosesReport>,
    @InjectRepository(PatientEncounter)
    private readonly encounterRepository: Repository<PatientEncounter>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /**
   * Create a new diagnosis report
   */
  async create(diagnosisData: Partial<DiagnosesReport>): Promise<DiagnosesReport> {
    const diagnosis = this.diagnosisRepository.create(diagnosisData);
    return await this.diagnosisRepository.save(diagnosis);
  }

  /**
   * Find diagnosis by ID
   */
  async findById(id: string): Promise<DiagnosesReport | null> {
    return await this.diagnosisRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['encounter', 'encounter.patient']
    });
  }

  /**
   * Find diagnoses by encounter ID
   */
  async findByEncounterId(encounterId: string): Promise<DiagnosesReport[]> {
    return await this.diagnosisRepository.find({
      where: { encounterId, isDeleted: false },
      relations: ['encounter'],
      order: { diagnosisDate: 'DESC' }
    });
  }

  /**
   * Find diagnoses by patient ID
   */
  async findByPatientId(patientId: string, limit?: number): Promise<DiagnosesReport[]> {
    const queryBuilder = this.diagnosisRepository
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
  async findAll(filters: DiagnosisSearchFilters = {}): Promise<DiagnosesReport[]> {
    const queryBuilder = this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('diagnosis.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.encounterId) {
      queryBuilder.andWhere('diagnosis.encounterId = :encounterId', {
        encounterId: filters.encounterId
      });
    }

    if (filters.patientId) {
      queryBuilder.andWhere('encounter.patientId = :patientId', {
        patientId: filters.patientId
      });
    }

    if (filters.diagnosisType) {
      queryBuilder.andWhere('diagnosis.diagnosisType = :diagnosisType', {
        diagnosisType: filters.diagnosisType
      });
    }

    if (filters.diagnosisStatus) {
      queryBuilder.andWhere('diagnosis.diagnosisStatus = :diagnosisStatus', {
        diagnosisStatus: filters.diagnosisStatus
      });
    }

    if (filters.severity) {
      queryBuilder.andWhere('diagnosis.severity = :severity', {
        severity: filters.severity
      });
    }

    if (filters.diagnosedBy) {
      queryBuilder.andWhere('diagnosis.diagnosedBy = :diagnosedBy', {
        diagnosedBy: filters.diagnosedBy
      });
    }

    if (filters.diagnosisDateFrom) {
      queryBuilder.andWhere('diagnosis.diagnosisDate >= :diagnosisDateFrom', {
        diagnosisDateFrom: filters.diagnosisDateFrom
      });
    }

    if (filters.diagnosisDateTo) {
      queryBuilder.andWhere('diagnosis.diagnosisDate <= :diagnosisDateTo', {
        diagnosisDateTo: filters.diagnosisDateTo
      });
    }

    if (filters.diagnosisName) {
      queryBuilder.andWhere('diagnosis.diagnosisName ILIKE :diagnosisName', {
        diagnosisName: `%${filters.diagnosisName}%`
      });
    }

    if (filters.followupRequired !== undefined) {
      queryBuilder.andWhere('diagnosis.followupRequired = :followupRequired', {
        followupRequired: filters.followupRequired
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
   * Find diagnoses with pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<DiagnosisSearchFilters, 'limit' | 'offset'> = {}
  ): Promise<{ diagnoses: DiagnosesReport[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const [diagnoses, total] = await this.diagnosisRepository.findAndCount({
      where: this.buildWhereClause(filters),
      relations: ['encounter', 'encounter.patient'],
      order: { diagnosisDate: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      diagnoses,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update diagnosis by ID
   */
  async update(id: string, updateData: Partial<DiagnosesReport>): Promise<DiagnosesReport | null> {
    await this.diagnosisRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Soft delete diagnosis by ID
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.diagnosisRepository.update(id, { isDeleted: true });
    return result.affected > 0;
  }

  /**
   * Hard delete diagnosis by ID (use with caution)
   */
  async hardDelete(id: string): Promise<boolean> {
    const result = await this.diagnosisRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Restore soft-deleted diagnosis
   */
  async restore(id: string): Promise<boolean> {
    const result = await this.diagnosisRepository.update(id, { isDeleted: false });
    return result.affected > 0;
  }

  /**
   * Get diagnosis with detailed information
   */
  async findDiagnosisWithDetails(id: string): Promise<DiagnosisWithDetails | null> {
    const diagnosis = await this.diagnosisRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['encounter', 'encounter.patient']
    });

    if (!diagnosis) {
      return null;
    }

    return {
      ...diagnosis,
      patient: diagnosis.encounter?.patient
    } as DiagnosisWithDetails;
  }

  /**
   * Get diagnoses by physician ID
   */
  async findByPhysicianId(physicianId: string, limit?: number): Promise<DiagnosesReport[]> {
    const queryBuilder = this.diagnosisRepository
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
    followupRequiredCount: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const whereClause = patientId 
      ? { encounter: { patientId }, isDeleted: false }
      : { isDeleted: false };

    const [totalDiagnoses, diagnosesThisMonth, allDiagnoses] = await Promise.all([
      this.diagnosisRepository.count({ where: whereClause }),
      this.diagnosisRepository.count({ 
        where: { 
          ...whereClause,
          diagnosisDate: Between(startOfMonth, now)
        } 
      }),
      this.diagnosisRepository.find({ 
        where: whereClause,
        select: ['diagnosisType', 'diagnosisStatus', 'severity', 'followupRequired']
      })
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

    // Count follow-up required
    const followupRequiredCount = allDiagnoses.filter(d => d.followupRequired).length;

    return {
      totalDiagnoses,
      diagnosesByType,
      diagnosesByStatus,
      diagnosesBySeverity,
      diagnosesThisMonth,
      followupRequiredCount
    };
  }

  /**
   * Search diagnoses by name
   */
  async searchByDiagnosisName(searchTerm: string, limit: number = 10): Promise<DiagnosesReport[]> {
    return await this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('diagnosis.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('diagnosis.diagnosisName ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`
      })
      .orderBy('diagnosis.diagnosisDate', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Get diagnoses requiring follow-up
   */
  async getFollowupRequired(limit?: number): Promise<DiagnosesReport[]> {
    const queryBuilder = this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('diagnosis.followupRequired = :followupRequired', { followupRequired: true })
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
  async getRecentDiagnoses(patientId: string, limit: number = 5): Promise<DiagnosesReport[]> {
    return await this.diagnosisRepository
      .createQueryBuilder('diagnosis')
      .leftJoinAndSelect('diagnosis.encounter', 'encounter')
      .where('encounter.patientId = :patientId', { patientId })
      .andWhere('diagnosis.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('diagnosis.diagnosisDate', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: Omit<DiagnosisSearchFilters, 'limit' | 'offset'>): FindOptionsWhere<DiagnosesReport> {
    const where: FindOptionsWhere<DiagnosesReport> = { isDeleted: false };

    if (filters.encounterId) {
      where.encounterId = filters.encounterId;
    }

    if (filters.diagnosisType) {
      where.diagnosisType = filters.diagnosisType;
    }

    if (filters.diagnosisStatus) {
      where.diagnosisStatus = filters.diagnosisStatus;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.diagnosedBy) {
      where.diagnosedBy = filters.diagnosedBy;
    }

    if (filters.diagnosisName) {
      where.diagnosisName = { $like: `%${filters.diagnosisName}%` } as any;
    }

    if (filters.followupRequired !== undefined) {
      where.followupRequired = filters.followupRequired;
    }

    if (filters.diagnosisDateFrom || filters.diagnosisDateTo) {
      where.diagnosisDate = Between(
        filters.diagnosisDateFrom || new Date('1900-01-01'),
        filters.diagnosisDateTo || new Date()
      );
    }

    return where;
  }
}
