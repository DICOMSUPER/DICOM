import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, Like, Between } from 'typeorm';
import { Patient } from '../entities/patients/patients.entity';
import { PatientEncounter } from '../entities/patients/patient-encounters.entity';
import { DiagnosesReport } from '../entities/patients/diagnoses-reports.entity';
import { PatientCondition } from '../entities/patients/patient-conditions';

export interface PatientSearchFilters {
  patientCode?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: string;
  bloodType?: string;
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  limit?: number;
  offset?: number;
}

export interface PatientWithRelations {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber?: string;
  address?: string;
  bloodType?: string;
  insuranceNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  isDeleted?: boolean;
  encounters?: PatientEncounter[];
  conditions?: any[];
  diagnosesCount?: number;
  lastEncounterDate?: Date;
}

@Injectable()
export class PatientRepository {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(PatientEncounter)
    private readonly encounterRepository: Repository<PatientEncounter>,
    @InjectRepository(DiagnosesReport)
    private readonly diagnosisRepository: Repository<DiagnosesReport>,
    @InjectRepository(PatientCondition)
    private readonly patientConditionRepository: Repository<PatientCondition>,
  ) {}

  /**
   * Create a new patient
   */
  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(patientData);
    return await this.patientRepository.save(patient);
  }

  /**
   * Find patient by ID
   */
  async findById(id: string): Promise<Patient | null> {
    return await this.patientRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['encounters', 'conditions']
    });
  }

  /**
   * Find patient by patient code
   */
  async findByPatientCode(patientCode: string): Promise<Patient | null> {
    return await this.patientRepository.findOne({
      where: { patientCode, isDeleted: false },
      relations: ['encounters', 'conditions']
    });
  }

  /**
   * Find all patients with optional filters
   */
  async findAll(filters: PatientSearchFilters = {}): Promise<Patient[]> {
    const queryBuilder = this.patientRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.encounters', 'encounters')
      .leftJoinAndSelect('patient.conditions', 'conditions')
      .where('patient.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.patientCode) {
      queryBuilder.andWhere('patient.patientCode ILIKE :patientCode', {
        patientCode: `%${filters.patientCode}%`
      });
    }

    if (filters.firstName) {
      queryBuilder.andWhere('patient.firstName ILIKE :firstName', {
        firstName: `%${filters.firstName}%`
      });
    }

    if (filters.lastName) {
      queryBuilder.andWhere('patient.lastName ILIKE :lastName', {
        lastName: `%${filters.lastName}%`
      });
    }

    if (filters.dateOfBirth) {
      queryBuilder.andWhere('patient.dateOfBirth = :dateOfBirth', {
        dateOfBirth: filters.dateOfBirth
      });
    }

    if (filters.gender) {
      queryBuilder.andWhere('patient.gender = :gender', {
        gender: filters.gender
      });
    }

    if (filters.bloodType) {
      queryBuilder.andWhere('patient.bloodType = :bloodType', {
        bloodType: filters.bloodType
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('patient.isActive = :isActive', {
        isActive: filters.isActive
      });
    }

    if (filters.createdFrom) {
      queryBuilder.andWhere('patient.createdAt >= :createdFrom', {
        createdFrom: filters.createdFrom
      });
    }

    if (filters.createdTo) {
      queryBuilder.andWhere('patient.createdAt <= :createdTo', {
        createdTo: filters.createdTo
      });
    }

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('patient.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Find patients with pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters: Omit<PatientSearchFilters, 'limit' | 'offset'> = {}
  ): Promise<{ patients: Patient[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    
    const [patients, total] = await this.patientRepository.findAndCount({
      where: this.buildWhereClause(filters),
      relations: ['encounters', 'conditions'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Update patient by ID
   */
  async update(id: string, updateData: Partial<Patient>): Promise<Patient | null> {
    await this.patientRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Soft delete patient by ID
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.patientRepository.update(id, { 
      isDeleted: true,
      isActive: false 
    });
    return result.affected > 0;
  }

  /**
   * Hard delete patient by ID (use with caution)
   */
  async hardDelete(id: string): Promise<boolean> {
    const result = await this.patientRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Restore soft-deleted patient
   */
  async restore(id: string): Promise<boolean> {
    const result = await this.patientRepository.update(id, { 
      isDeleted: false,
      isActive: true 
    });
    return result.affected > 0;
  }

  /**
   * Check if patient code exists
   */
  async existsByPatientCode(patientCode: string, excludeId?: string): Promise<boolean> {
    const where: FindOptionsWhere<Patient> = { 
      patientCode, 
      isDeleted: false 
    };
    
    if (excludeId) {
      where.id = { $ne: excludeId } as any;
    }

    const count = await this.patientRepository.count({ where });
    return count > 0;
  }

  /**
   * Get patient statistics
   */
  async getPatientStats(): Promise<{
    totalPatients: number;
    activePatients: number;
    inactivePatients: number;
    deletedPatients: number;
    newPatientsThisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPatients,
      activePatients,
      inactivePatients,
      deletedPatients,
      newPatientsThisMonth
    ] = await Promise.all([
      this.patientRepository.count({ where: { isDeleted: false } }),
      this.patientRepository.count({ where: { isActive: true, isDeleted: false } }),
      this.patientRepository.count({ where: { isActive: false, isDeleted: false } }),
      this.patientRepository.count({ where: { isDeleted: true } }),
      this.patientRepository.count({ 
        where: { 
          createdAt: Between(startOfMonth, now),
          isDeleted: false 
        } 
      })
    ]);

    return {
      totalPatients,
      activePatients,
      inactivePatients,
      deletedPatients,
      newPatientsThisMonth
    };
  }

  /**
   * Search patients by name (first name or last name)
   */
  async searchByName(searchTerm: string, limit: number = 10): Promise<Patient[]> {
    return await this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(
        '(patient.firstName ILIKE :searchTerm OR patient.lastName ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      )
      .orderBy('patient.lastName', 'ASC')
      .addOrderBy('patient.firstName', 'ASC')
      .limit(limit)
      .getMany();
  }

  /**
   * Get patient with detailed information including encounters and diagnoses
   */
  async findPatientWithDetails(id: string): Promise<PatientWithRelations | null> {
    const patient = await this.patientRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['encounters', 'conditions']
    });

    if (!patient) {
      return null;
    }

    // Get diagnoses count
    const diagnosesCount = await this.diagnosisRepository.count({
      where: { encounterId: { $in: patient.encounters.map(e => e.id) } } as any
    });

    // Get last encounter date
    const lastEncounter = await this.encounterRepository.findOne({
      where: { patientId: id },
      order: { encounterDate: 'DESC' }
    });

    return {
      ...patient,
      diagnosesCount,
      lastEncounterDate: lastEncounter?.encounterDate
    } as PatientWithRelations;
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: Omit<PatientSearchFilters, 'limit' | 'offset'>): FindOptionsWhere<Patient> {
    const where: FindOptionsWhere<Patient> = { isDeleted: false };

    if (filters.patientCode) {
      where.patientCode = Like(`%${filters.patientCode}%`);
    }

    if (filters.firstName) {
      where.firstName = Like(`%${filters.firstName}%`);
    }

    if (filters.lastName) {
      where.lastName = Like(`%${filters.lastName}%`);
    }

    if (filters.dateOfBirth) {
      where.dateOfBirth = filters.dateOfBirth;
    }

    if (filters.gender) {
      where.gender = filters.gender as any;
    }

    if (filters.bloodType) {
      where.bloodType = filters.bloodType as any;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = Between(
        filters.createdFrom || new Date('1900-01-01'),
        filters.createdTo || new Date()
      );
    }

    return where;
  }

  // Patient Condition Methods
  async createCondition(createConditionDto: any): Promise<any> {
    const condition = this.patientConditionRepository.create(createConditionDto);
    return await this.patientConditionRepository.save(condition);
  }

  async findAllConditions(): Promise<any[]> {
    return await this.patientConditionRepository.find({
      relations: ['patient'],
      order: { recordedDate: 'DESC' }
    });
  }

  async findConditionsByPatientId(patientId: string): Promise<any[]> {
    return await this.patientConditionRepository.find({
      where: { patientId },
      order: { recordedDate: 'DESC' }
    });
  }

  async findConditionById(id: string): Promise<any> {
    return await this.patientConditionRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async updateCondition(id: string, updateConditionDto: any): Promise<any> {
    await this.patientConditionRepository.update(id, updateConditionDto);
    return await this.findConditionById(id);
  }

  async deleteCondition(id: string): Promise<boolean> {
    const result = await this.patientConditionRepository.delete(id);
    return result.affected > 0;
  }
}
