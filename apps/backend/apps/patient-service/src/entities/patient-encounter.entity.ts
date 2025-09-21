import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';

export enum EncounterType {
  outpatient = 'outpatient',
  inpatient = 'inpatient',
  emergency = 'emergency'
}

export enum EncounterStatus {
  planned = 'planned',
  arrived = 'arrived',
  triaged = 'triaged',
  in_progress = 'in-progress',
  onleave = 'onleave',
  finished = 'finished',
  cancelled = 'cancelled'
}

@Entity('patient_encounters')
export class PatientEncounter extends BaseEntity {
  @Column({ name: 'encounter_id', primary: true })
  encounterId!: string;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ name: 'encounter_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  encounterDate!: Date;

  @Column({ name: 'encounter_type', type: 'enum', enum: EncounterType })
  encounterType!: EncounterType;

  @Column({ name: 'status', type: 'enum', enum: EncounterStatus, default: EncounterStatus.arrived })
  status!: EncounterStatus;

  @Column({ name: 'chief_complaint', type: 'text', nullable: true })
  chiefComplaint?: string;

  @Column({ type: 'text', nullable: true })
  symptoms?: string;

  @Column({ name: 'vital_signs', type: 'json', nullable: true })
  vitalSigns?: Record<string, any>;

  @Column({ name: 'assigned_physician_id', nullable: true })
  assignedPhysicianId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Patient, patient => patient.encounters)
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;
}