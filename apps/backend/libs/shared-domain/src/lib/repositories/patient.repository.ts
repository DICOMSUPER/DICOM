import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  Like,
  Between,
} from 'typeorm';
import { BaseRepository } from '@backend/database';
import { RepositoryPaginationDto } from '@backend/database';
import { Patient } from '../entities/patients/patients.entity';
import { PatientEncounter } from '../entities/patients/patient-encounters.entity';
import { DiagnosesReport } from '../entities/patients/diagnoses-reports.entity';
import { PatientCondition } from '../entities/patients/patient-conditions';
import { DiagnosisStatus } from '@backend/shared-enums';

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
export class PatientRepository extends BaseRepository<Patient> {
  constructor(entityManager: EntityManager) {
    super(Patient, entityManager);
  }

  /**
   * Find patient by ID with relations
   */
  async findByIdWithRelations(id: string): Promise<Patient | null> {
    return await this.findOne({ where: { id } }, ['encounters', 'conditions']);
  }

  /**
   * Find patient by patient code
   */
  async findByPatientCode(patientCode: string): Promise<Patient | null> {
    return await this.findOne({ where: { patientCode } }, [
      'encounters',
      'conditions',
    ]);
  }

  /**
   * Find all patients with optional filters
   */
  async findAllWithFilters(
    filters: PatientSearchFilters = {}
  ): Promise<Patient[]> {
    const where = this.buildWhereClause(filters);
    const options: FindManyOptions<Patient> = {
      where,
      relations: ['encounters', 'conditions'],
      order: { createdAt: 'DESC' },
    };

    if (filters.limit) {
      options.take = filters.limit;
    }

    if (filters.offset) {
      options.skip = filters.offset;
    }

    return await this.findAll(options, ['encounters', 'conditions']);
  }

  /**
   * Find patients with pagination using BaseRepository paginate method
   */
  async findWithPagination(paginationDto: RepositoryPaginationDto): Promise<{
    patients: Patient[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Set default relations for patient queries
    const paginationWithRelations = {
      ...paginationDto,
      relation: paginationDto.relation || ['encounters', 'conditions'],
    };

    const result = await this.paginate(paginationWithRelations);

    return {
      patients: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  /**
   * Soft delete patient by ID with additional business logic
   */
  async softDeletePatient(id: string): Promise<boolean> {
    // First update the patient to be inactive and deleted
    const result = await this.getRepository().update(id, {
      isDeleted: true,
      isActive: false,
    });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Restore soft-deleted patient with additional business logic
   */
  async restorePatient(id: string): Promise<boolean> {
    const result = await this.getRepository().update(id, {
      isDeleted: false,
      isActive: true,
    });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if patient code exists
   */
  async existsByPatientCode(
    patientCode: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: FindOptionsWhere<Patient> = {
      patientCode,
    };

    if (excludeId) {
      where.id = { $ne: excludeId } as any;
    }

    const count = await this.getRepository().count({ where });
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
      newPatientsThisMonth,
    ] = await Promise.all([
      this.getRepository().count({ where: { isDeleted: false } }),
      this.getRepository().count({
        where: { isActive: true, isDeleted: false },
      }),
      this.getRepository().count({
        where: { isActive: false, isDeleted: false },
      }),
      this.getRepository().count({ where: { isDeleted: true } }),
      this.getRepository().count({
        where: {
          createdAt: Between(startOfMonth, now),
          isDeleted: false,
        },
      }),
    ]);

    return {
      totalPatients,
      activePatients,
      inactivePatients,
      deletedPatients,
      newPatientsThisMonth,
    };
  }

  /**
   * Get patient with detailed information including encounters and diagnoses
   */
  async findPatientWithDetails(
    id: string
  ): Promise<PatientWithRelations | null> {
    const patient = await this.findOne({ where: { id } }, [
      'encounters',
      'conditions',
    ]);

    if (!patient) {
      return null;
    }

    // Get diagnoses count
    const diagnosesCount = await this.getRepository().manager.count(
      DiagnosesReport,
      {
        where: {
          encounterId: { $in: patient.encounters.map((e) => e.id) },
        } as any,
      }
    );

    // Get last encounter date
    const lastEncounter = await this.getRepository().manager.findOne(
      PatientEncounter,
      {
        where: { patientId: id },
        order: { encounterDate: 'DESC' },
      }
    );

    return {
      ...patient,
      diagnosesCount,
      lastEncounterDate: lastEncounter?.encounterDate,
    } as PatientWithRelations;
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(
    filters: Omit<PatientSearchFilters, 'limit' | 'offset'>
  ): FindOptionsWhere<Patient> {
    const where: FindOptionsWhere<Patient> = {};

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
    const condition = this.getRepository().manager.create(
      PatientCondition,
      createConditionDto
    );
    return await this.getRepository().manager.save(PatientCondition, condition);
  }

  async findAllConditions(): Promise<any[]> {
    return await this.getRepository().manager.find(PatientCondition, {
      relations: ['patient'],
      order: { recordedDate: 'DESC' },
    });
  }

  async findConditionsByPatientId(patientId: string): Promise<any[]> {
    return await this.getRepository().manager.find(PatientCondition, {
      where: { patientId },
      order: { recordedDate: 'DESC' },
    });
  }

  async findConditionById(id: string): Promise<any> {
    return await this.getRepository().manager.findOne(PatientCondition, {
      where: { id },
      relations: ['patient'],
    });
  }

  async updateCondition(id: string, updateConditionDto: any): Promise<any> {
    await this.getRepository().manager.update(
      PatientCondition,
      id,
      updateConditionDto
    );
    return await this.findConditionById(id);
  }

  async deleteCondition(id: string): Promise<boolean> {
    const result = await this.getRepository().manager.delete(
      PatientCondition,
      id
    );
    return (result.affected ?? 0) > 0;
  }
  async filter(
    patientIds: string[] | [],
    patientFirstName?: string,
    patientLastName?: string,
    patientCode?: string
  ): Promise<Patient[]> {
    const repository = await this.getRepository();
    const qb = repository.createQueryBuilder('patient');

    if (patientIds.length > 0) {
      qb.andWhere('patient.id IN (:...patientIds)', { patientIds });
    } else {
      return [];
    }

    if (patientFirstName) {
      qb.andWhere('patient.first_name ILIKE :patientFirstName', {
        patientFirstName: `%${patientFirstName}%`,
      });
    }

    if (patientLastName) {
      qb.andWhere('patient.last_name ILIKE :patientLastName', {
        patientLastName: `%${patientLastName}%`,
      });
    }

    if (patientCode) {
      qb.andWhere('patient.patient_code ILIKE :patientCode', {
        patientCode: `%${patientCode}%`,
      });
    }

    return qb.getMany();
  }

  async filterPatientName(patientName: string): Promise<Patient[]> {
    const repository = await this.getRepository();
    const qb = repository.createQueryBuilder('patient');

    qb.where(
      `(patient.first_name || ' ' || patient.last_name) ILIKE :patientName`,
      { patientName: `%${patientName}%` }
    );

    return qb.getMany();
  }
}
