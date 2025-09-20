import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { EncounterType } from '@backend/shared-enums';
import { Patient } from './patients.entity';


@Entity('patient_encounters')
export class PatientEncounter {
  @PrimaryGeneratedColumn('uuid', { name: 'encounter_id' })
  id!: string;

  @Index()
  @Column({ name: 'patient_id' })
  patientId!: string;

  @Index()
  @Column({ name: 'encounter_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  encounterDate!: Date;

  @Index()
  @Column({ name: 'encounter_type', type: 'enum', enum: EncounterType })
  encounterType!: EncounterType;

  @Column({ name: 'chief_complaint', type: 'text', nullable: true })
  chiefComplaint?: string;

  @Column({ type: 'text', nullable: true })
  symptoms?: string;

  @Column({ name: 'vital_signs', type: 'json', nullable: true })
  vitalSigns?: object;

  @Index()
  @Column({ name: 'assigned_physician_id', nullable: true })
  assignedPhysicianId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', nullable: true })
  isDeleted?: boolean;

  // Relations
  @ManyToOne(() => Patient, patient => patient.encounters)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;
}
