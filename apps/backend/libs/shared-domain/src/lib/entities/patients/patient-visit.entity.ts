import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VisitType } from '@backend/shared-enums';
import { Patient } from './patient.entity';


@Entity('patient_visits')
export class PatientVisit {
  @PrimaryGeneratedColumn('uuid', { name: 'visit_id' })
  id!: string;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ name: 'visit_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  visitDate!: Date;

  @Column({ name: 'visit_type', type: 'enum', enum: VisitType })
  visitType!: VisitType;

  @Column({ name: 'chief_complaint', type: 'text', nullable: true })
  chiefComplaint?: string;

  @Column({ type: 'text', nullable: true })
  symptoms?: string;

  @Column({ name: 'vital_signs', type: 'json', nullable: true })
  vitalSigns?: object;

  @Column({ name: 'assigned_physician_id', nullable: true })
  assignedPhysicianId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @Column({ name: 'is_deleted', nullable: true })
  isDeleted?: boolean;

  // Relations
  @ManyToOne(() => Patient, patient => patient.visits)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}
