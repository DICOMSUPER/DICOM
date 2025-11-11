import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@backend/entities';

import {
  DiagnosisType,
  DiagnosisStatus,
  Severity,
} from '@backend/shared-enums';
import { PatientEncounter } from './patient-encounters.entity';
import { ReportTemplate } from './report-templates.entity';

@Entity('diagnoses_reports')
@Index(['encounterId'])
@Index(['studyId'])
@Index(['diagnosisDate'])
@Index(['diagnosisStatus'])
@Index(['diagnosedBy'])

export class DiagnosesReport extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'diagnosis_id' })
  id!: string;
  @Column({ name: 'encounter_id', type: 'uuid' })
  encounterId!: string;

  @ManyToOne(() => PatientEncounter)
  encounter!: PatientEncounter;

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

  @Column({ name: 'report_template_id', type: 'uuid', nullable: true })
  reportTemplateId?: string;

  @ManyToOne(() => ReportTemplate, (reportTemplate) => reportTemplate.diagnosisReports)
  @JoinColumn({ name: 'report_template_id' })
  reportTemplate?: ReportTemplate;

  @Column({ type: 'uuid', nullable: true })
  signatureId?: string;
}
