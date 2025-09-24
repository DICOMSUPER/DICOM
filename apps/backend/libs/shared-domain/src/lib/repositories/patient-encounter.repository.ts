import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
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

@Injectable()
export class PatientEncounterRepository {
  constructor(
    @InjectRepository(PatientEncounter)
    private readonly encounterRepository: Repository<PatientEncounter>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(DiagnosesReport)
    private readonly diagnosisRepository: Repository<DiagnosesReport>,
  ) {}

  /**
   * Create a new patient encounter
   */
  async create(encounterData: Partial<PatientEncounter>): Promise<PatientEncounter> {
    const encounter = this.encounterRepository.create(encounterData);
    return await this.encounterRepository.save(encounter);
  }

  /**
   * Find encounter by ID
   */
  async findById(id: string): Promise<PatientEncounter | null> {
    return await this.encounterRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['patient']
    });
  }

  /**
   * Find encounters by patient ID
   */
  async findByPatientId(patientId: string, limit?: number): Promise<PatientEncounter[]> {
    const queryBuilder = this.encounterRepository
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
  async findAll(filters: EncounterSearchFilters = {}): Promise<PatientEncounter[]> {
    const queryBuilder = this.encounterRepository
      .createQueryBuilder('encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.patientId) {
      queryBuilder.andWhere('encounter.patientId = :patientId', {
        patientId: filters.patientId
      });
    }

    if (filters.encounterType) {
      queryBuilder.andWhere('encounter.encounterType = :encounterType', {
        encounterType: filters.encounterType
      });
    }

    if (filters.encounterDateFrom) {
      queryBuilder.andWhere('encounter.encounterDate >= :encounterDateFrom', {
        encounterDateFrom: filters.encounterDateFrom
      });
    }

    if (filters.encounterDateTo) {
      queryBuilder.andWhere('encounter.encounterDate <= :encounterDateTo', {
        encounterDateTo: filters.encounterDateTo
      });
    }

    if (filters.assignedPhysicianId) {
      queryBuilder.andWhere('encounter.assignedPhysicianId = :assignedPhysicianId', {
        assignedPhysicianId: filters.assignedPhysicianId
      });
    }

    if (filters.chiefComplaint) {
      queryBuilder.andWhere('encounter.chiefComplaint ILIKE :chiefComplaint', {
        chiefComplaint: `%${filters.chiefComplaint}%`
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
   * Find encounters with pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<EncounterSearchFilters, 'limit' | 'offset'> = {}
  ): Promise<{ encounters: PatientEncounter[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const [encounters, total] = await this.encounterRepository.findAndCount({
      where: this.buildWhereClause(filters),
      relations: ['patient'],
      order: { encounterDate: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      encounters,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update encounter by ID
   */
  async update(id: string, updateData: Partial<PatientEncounter>): Promise<PatientEncounter | null> {
    await this.encounterRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Soft delete encounter by ID
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.encounterRepository.update(id, { isDeleted: true });
    return result.affected > 0;
  }

  /**
   * Hard delete encounter by ID (use with caution)
   */
  async hardDelete(id: string): Promise<boolean> {
    const result = await this.encounterRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Restore soft-deleted encounter
   */
  async restore(id: string): Promise<boolean> {
    const result = await this.encounterRepository.update(id, { isDeleted: false });
    return result.affected > 0;
  }

  /**
   * Get encounter with detailed information including diagnoses
   */
  async findEncounterWithDetails(id: string): Promise<EncounterWithDetails | null> {
    const encounter = await this.encounterRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['patient']
    });

    if (!encounter) {
      return null;
    }

    // Get diagnoses for this encounter
    const diagnoses = await this.diagnosisRepository.find({
      where: { encounterId: id, isDeleted: false },
      order: { diagnosisDate: 'DESC' }
    });

    return {
      ...encounter,
      diagnoses,
      diagnosesCount: diagnoses.length
    } as EncounterWithDetails;
  }

  /**
   * Get encounters by physician ID
   */
  async findByPhysicianId(physicianId: string, limit?: number): Promise<PatientEncounter[]> {
    const queryBuilder = this.encounterRepository
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

    const whereClause = patientId ? { patientId, isDeleted: false } : { isDeleted: false };

    const [totalEncounters, encountersThisMonth, allEncounters] = await Promise.all([
      this.encounterRepository.count({ where: whereClause }),
      this.encounterRepository.count({ 
        where: { 
          ...whereClause,
          encounterDate: Between(startOfMonth, now)
        } 
      }),
      this.encounterRepository.find({ 
        where: whereClause,
        select: ['encounterType']
      })
    ]);

    // Count encounters by type
    const encountersByType = allEncounters.reduce((acc, encounter) => {
      const type = encounter.encounterType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average encounters per patient
    const uniquePatients = new Set(allEncounters.map(e => e.patientId)).size;
    const averageEncountersPerPatient = uniquePatients > 0 ? totalEncounters / uniquePatients : 0;

    return {
      totalEncounters,
      encountersByType,
      encountersThisMonth,
      averageEncountersPerPatient
    };
  }

  /**
   * Search encounters by chief complaint
   */
  async searchByChiefComplaint(searchTerm: string, limit: number = 10): Promise<PatientEncounter[]> {
    return await this.encounterRepository
      .createQueryBuilder('encounter')
      .leftJoinAndSelect('encounter.patient', 'patient')
      .where('encounter.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('encounter.chiefComplaint ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`
      })
      .orderBy('encounter.encounterDate', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Get recent encounters for a patient
   */
  async getRecentEncounters(patientId: string, limit: number = 5): Promise<PatientEncounter[]> {
    return await this.encounterRepository.find({
      where: { patientId, isDeleted: false },
      relations: ['patient'],
      order: { encounterDate: 'DESC' },
      take: limit
    });
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: Omit<EncounterSearchFilters, 'limit' | 'offset'>): FindOptionsWhere<PatientEncounter> {
    const where: FindOptionsWhere<PatientEncounter> = { isDeleted: false };

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.encounterType) {
      where.encounterType = filters.encounterType;
    }

    if (filters.assignedPhysicianId) {
      where.assignedPhysicianId = filters.assignedPhysicianId;
    }

    if (filters.chiefComplaint) {
      where.chiefComplaint = { $like: `%${filters.chiefComplaint}%` } as any;
    }

    if (filters.encounterDateFrom || filters.encounterDateTo) {
      where.encounterDate = Between(
        filters.encounterDateFrom || new Date('1900-01-01'),
        filters.encounterDateTo || new Date()
      );
    }

    return where;
  }
}
