import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '@backend/database';

import { Gender } from '@backend/shared-enums';
import { BloodType } from '@backend/shared-enums';
import { PatientEncounter } from './patient-encounters.entity';
import { PatientCondition } from './patient-conditions.entity';

@Entity('patients')
@Index('idx_patient_code', ['patientCode'])
@Index('idx_patient_name', ['lastName', 'firstName'])
@Index('idx_patient_dob', ['dateOfBirth'])
export class Patient extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'patient_id' })
  id!: string;

  @Column({ name: 'patient_code', length: 40, unique: true, nullable: true })
  patientCode!: string;

  @Column({ name: 'first_name', length: 50 })
  firstName!: string;

  @Column({ name: 'last_name', length: 50 })
  lastName!: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth!: Date;

  @Column({ type: 'enum', enum: Gender })
  gender!: Gender;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'blood_type', type: 'enum', enum: BloodType, nullable: true })
  bloodType?: BloodType;

  @Column({ name: 'insurance_number', length: 50, nullable: true })
  insuranceNumber?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  // Relations
  @OneToMany(() => PatientCondition, (condition) => condition.patient)
  conditions!: PatientCondition[];

  @OneToMany(() => PatientEncounter, (encounter) => encounter.patient)
  encounters!: PatientEncounter[];
}
