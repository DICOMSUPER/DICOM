import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/entities';
import { EncounterType } from '@backend/shared-enums';
import type { VitalSignsCollection } from '@backend/shared-interfaces';
import { Patient } from './patients.entity';

@Entity('patient_encounters')
export class PatientEncounter extends BaseEntity {
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
    vitalSigns?: VitalSignsCollection;

    @Index()
    @Column({ name: 'assigned_physician_id', nullable: true })
    assignedPhysicianId?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;


    // Relations
    @ManyToOne(() => Patient, patient => patient.encounters)
    @JoinColumn({ name: 'patient_id' })
    patient!: Patient;
  }
