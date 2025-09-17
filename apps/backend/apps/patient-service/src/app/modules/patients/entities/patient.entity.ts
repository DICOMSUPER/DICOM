import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { PatientVisit } from '../../patient-visits/entities/patient-visit.entity';
import { MedicalHistory } from '../../medical-history/entities/medical-history.entity';
import { Gender } from '@backend/shared-enums';

@Entity('patients')
@Index('idx_patient_code', ['patientCode'])
@Index('idx_patient_name', ['lastName', 'firstName'])
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

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'blood_type', length: 5, nullable: true })
  bloodType?: string;

  @Column({ name: 'medical_history_id', nullable: true })
  medicalHistoryId?: string;

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
  @OneToMany(() => PatientVisit, visit => visit.patient)
  visits!: PatientVisit[];

  @OneToOne(() => MedicalHistory)
  @JoinColumn({ name: 'medical_history_id' })
  medicalHistory?: MedicalHistory;
}
