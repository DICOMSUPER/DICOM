import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@backend/database';
import {
  ClinicalStatus,
} from '@backend/shared-enums';
import type { Patient } from './patients.entity';

@Entity('patient_conditions')
export class PatientCondition extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'condition_id' })
  id!: string;

  @Index()
  @Column({ name: 'patient_id' })
  patientId!: string;

  @Index()
  @Column({ name: 'code', length: 50 })
  code!: string;

  @Column({ name: 'code_system', length: 100, nullable: true })
  codeSystem?: string;

  @Column({ name: 'code_display', length: 255, nullable: true })
  codeDisplay?: string;

  @Index()
  @Column({
    name: 'clinical_status',
    type: 'enum',
    enum: ClinicalStatus,
    nullable: true,
  })
  clinicalStatus?: ClinicalStatus;



  // severity as simple string or code; keeping string for flexibility


  // bodySite simplified
  @Column({ name: 'body_site', length: 100, nullable: true })
  bodySite?: string;

  @Index()
  @Column({
    name: 'recorded_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  recordedDate!: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(
    () => require('./patients.entity').Patient,
    (patient: Patient) => patient.conditions
  )
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;
}
