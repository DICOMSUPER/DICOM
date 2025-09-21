import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PatientEncounter } from './patient-encounter.entity';
import { PatientCondition } from './patient-condition.entity';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  Unknown = 'unknown'
}

export enum BloodType {
  A_Positive = 'A+',
  A_Negative = 'A-',
  B_Positive = 'B+',
  B_Negative = 'B-',
  AB_Positive = 'AB+',
  AB_Negative = 'AB-',
  O_Positive = 'O+',
  O_Negative = 'O-',
  Unknown = 'unknown'
}

@Entity('patients')
export class Patient extends BaseEntity {
  @Column({ name: 'patient_id', primary: true })
  patientId!: string;

  @Index()
  @Column({ name: 'patient_code', length: 20, unique: true })
  patientCode!: string;

  @Column({ name: 'first_name', length: 50 })
  firstName!: string;

  @Column({ name: 'last_name', length: 50 })
  lastName!: string;

  @Index()
  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth!: Date;

  @Column({ type: 'enum', enum: Gender })
  gender!: Gender;

  @Column({ name: 'phone_number',length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'insurance_number', length: 50, nullable: true })
  insuranceNumber?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'blood_type', type: 'enum', enum: BloodType, nullable: true })
  bloodType?: BloodType;

  // list of conditions for this patient
  @OneToMany(() => PatientCondition, condition => condition.patient)
  conditions!: PatientCondition[];

  @OneToMany(() => PatientEncounter, encounter => encounter.patient)
  encounters!: PatientEncounter[];
}