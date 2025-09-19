import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';

export enum ClinicalStatus {
  active = 'active',
  recurrence = 'recurrence',
  relapse = 'relapse',
  inactive = 'inactive',
  remission = 'remission',
  resolved = 'resolved'
}

export enum VerificationStatus {
  unconfirmed = 'unconfirmed',
  provisional = 'provisional',
  differential = 'differential',
  confirmed = 'confirmed',
  refuted = 'refuted',
  entered_in_error = 'entered-in-error'
}

@Entity('patient_conditions')
export class PatientCondition extends BaseEntity {
  @Column({ name: 'condition_id', primary: true })
  conditionId!: string;

  @Index()
  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ name: 'code', length: 50 })
  code!: string;

  @Column({ name: 'code_system', length: 100, nullable: true })
  codeSystem?: string;

  @Column({ name: 'code_display', length: 255, nullable: true })
  codeDisplay?: string;

  @Column({ name: 'clinical_status', type: 'enum', enum: ClinicalStatus, nullable: true })
  clinicalStatus?: ClinicalStatus;

  @Column({ name: 'verification_status', type: 'enum', enum: VerificationStatus, nullable: true })
  verificationStatus?: VerificationStatus;

  // severity as simple string or code; keeping string for flexibility
  @Column({ name: 'severity', length: 50, nullable: true })
  severity?: string;

  // clinical stage/notes
  @Column({ name: 'stage_summary', length: 100, nullable: true })
  stageSummary?: string;

  // bodySite simplified
  @Column({ name: 'body_site', length: 100, nullable: true })
  bodySite?: string;

  @Column({ name: 'recorded_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedDate!: Date;
  
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Patient, patient => patient.conditions)
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;
}


