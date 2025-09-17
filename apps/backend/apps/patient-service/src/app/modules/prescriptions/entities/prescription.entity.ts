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
import { PatientVisit } from '../../patient-visits/entities/patient-visit.entity';
import { PrescriptionItem } from '../../prescription-items/entities/prescription-item.entity';
import { DiagnosesReport } from '../../diagnoses-report/entities/diagnoses-report.entity';

@Entity('prescriptions')
@Index(['visitId'])
@Index(['prescriptionDate'])
@Index(['prescribedBy'])
export class Prescription {
  @PrimaryGeneratedColumn('uuid', { name: 'prescription_id' })
  id!: string;

  @Column({ name: 'visit_id', type: 'uuid' })
  visitId!: string;

  @ManyToOne(() => PatientVisit)
  @JoinColumn({ name: 'visit_id' })
  visit!: PatientVisit;
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
