import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';

import { Gender } from '@backend/shared-enums';
import { BloodType } from '@backend/shared-enums';
import { PatientEncounter } from './patient-encounters.entity';
import { PatientCondition } from './patient-conditions';

@Entity('patients')
@Index('idx_patient_code', ['patientCode'])
@Index('idx_patient_name', ['lastName', 'firstName'])
@Index('idx_patient_dob', ['dateOfBirth'])
export class Patient {
  @PrimaryGeneratedColumn('uuid', { name: 'patient_id' })
  id!: string;

  @Column({ name: 'patient_code', length: 20, unique: true })
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ name: 'is_deleted', nullable: true })
  isDeleted?: boolean;

  // Relations
  @OneToMany(() => PatientCondition, condition => condition.patient)
  conditions!: PatientCondition[];

  @OneToMany(() => PatientEncounter, encounter => encounter.patient)
  encounters!: PatientEncounter[];
}
