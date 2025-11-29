import { BaseEntity } from '@backend/database';
import {
  EncounterPriorityLevel,
  EncounterStatus,
  EncounterType,
} from '@backend/shared-enums';
import type { VitalSignsSimplified } from '@backend/shared-interfaces';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Patient } from './patients.entity';
import { ServiceRoom } from '../users';

@Entity('patient_encounters')
export class PatientEncounter extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'encounter_id' })
  id!: string;

  @Index()
  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ name: 'order_number', nullable: true })
  orderNumber!: number;

  @Index()
  @Column({
    name: 'encounter_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  encounterDate!: Date;

  @Index()
  @Column({ name: 'encounter_type', type: 'enum', enum: EncounterType })
  encounterType!: EncounterType;

  @Column({ name: 'chief_complaint', type: 'text', nullable: true })
  chiefComplaint?: string;

  @Column({ type: 'text', nullable: true })
  symptoms?: string;

  @Column({ name: 'vital_signs', type: 'json', nullable: true })
  vitalSigns?: VitalSignsSimplified;

  @Column({
    type: 'enum',
    enum: EncounterPriorityLevel,
    default: EncounterPriorityLevel.ROUTINE,
  })
  priority!: EncounterPriorityLevel;

  @Column({
    type: 'enum',
    enum: EncounterStatus,
    default: EncounterStatus.ARRIVED,
  })
  status!: EncounterStatus;

  @Index()
  @Column({ name: 'assigned_physician_id', nullable: true })
  assignedPhysicianId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => require('./patients.entity').Patient, (patient: Patient) => patient.encounters)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column({ name: 'service_room_id', type: 'uuid', nullable: true })
  serviceRoomId?: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  serviceRoom?: ServiceRoom;
}
