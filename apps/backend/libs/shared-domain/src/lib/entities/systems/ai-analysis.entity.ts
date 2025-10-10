import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { AnalysisStatus } from '@backend/shared-enums';

@Entity('ai_analyses')
export class AiAnalysis extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'analysis_id' })
  id!: string;

  @Column({ name: 'study_id' })
  studyId!: string;

  @Column({ name: 'series_id', nullable: true })
  seriesId!: string;

  @Column({ name: 'analysis_status', type: 'enum', enum: AnalysisStatus, default: AnalysisStatus.PENDING })
  analysisStatus!: AnalysisStatus;

  @Column({ name: 'analysis_results', type: 'json', nullable: true })
  analysisResults?: any;

  @Column({ type: 'text', nullable: true })
  findings?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'is_deleted', nullable: true , default: false})
  isDeleted?: boolean;
}
