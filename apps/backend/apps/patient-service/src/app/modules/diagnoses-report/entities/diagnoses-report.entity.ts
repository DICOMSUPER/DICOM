import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import {
  DiagnosisType,
  DiagnosisStatus,
  Severity,
} from '@backend/shared-enums';

@Entity('diagnoses_report')
@Index(['visitId'])
export class DiagnosesReport {
  @PrimaryGeneratedColumn('uuid', { name: 'diagnosis_id' })
  id!: string;

  @Column({ name: 'study_id', type: 'uuid' })
  studyId!: string;

  @Column({ name: 'diagnosis_name', length: 255 })
  diagnosisName!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'diagnosis_type', type: 'enum', enum: DiagnosisType })
  diagnosisType!: DiagnosisType;

  @Column({
    name: 'diagnosis_status',
    type: 'enum',
    enum: DiagnosisStatus,
    default: DiagnosisStatus.ACTIVE,
  })
  diagnosisStatus!: DiagnosisStatus;
  @Column({ name: 'severity', type: 'enum', enum: Severity, nullable: true })
  severity!: Severity;

  @Column({ name: 'diagnosis_date', type: 'date' })
  diagnosisDate!: Date;

  @Column({ name: 'diagnosed_by', type: 'uuid' })
  diagnosedBy!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'followup_required', default: false })
  followupRequired!: boolean;

  @Column({ name: 'follow_up_instructions', default: false })
  followUpInstructions!: boolean;

  @Column({ name: 'is_deleted', default: false })
  isDeleted?: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
