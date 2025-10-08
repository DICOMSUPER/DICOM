import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PatientEncounter } from './patient-encounters.entity';
import { DiagnosesReport } from './diagnoses-reports.entity';
import { PrescriptionItem } from './prescription-items.entity';


@Entity('prescriptions')
@Index(['encounterId'])
@Index(['report_id'])
@Index(['physicianId'])
@Index(['prescriptionDate'])
export class Prescription {
  @PrimaryGeneratedColumn('uuid', { name: 'prescription_id' })
  id!: string;

  @Column({ name: 'encounter_id', type: 'uuid' })
  encounterId!: string;

  @ManyToOne(() => PatientEncounter)
  @JoinColumn({ name: 'encounter_id' })
  encounter!: PatientEncounter;
  //   diagnosis report
  @Column({ name: 'report_id', type: 'text', nullable: true })
  report_id?: string;


  @ManyToOne(() => DiagnosesReport)
  @JoinColumn({ name: 'report_id' })
  report?: DiagnosesReport;

  //   code
  @Column({ name: 'prescription_number', length: 50, unique: true })
  prescriptionNumber!: string;

  @Column({ name: 'prescription_date', type: 'date' })
  prescriptionDate!: Date;

  @Column({ name: 'physician_id', type: 'uuid' })
  physicianId!: string;
  
  @Column({ name: 'followup_required', default: false })
  followupRequired!: boolean;

  @Column({ name: 'follow_up_date', type: 'date', nullable: true })
  followUpDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => PrescriptionItem, (item) => item.prescription)
  items!: PrescriptionItem[];
}
