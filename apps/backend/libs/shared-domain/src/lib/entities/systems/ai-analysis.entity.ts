import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@backend/database';
import { AnalysisStatus } from '@backend/shared-enums';
import { AiModel } from './ai-model.entity';

@Entity('ai_analyses')
export class AiAnalysis extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'analysis_id' })
  id!: string;

  @Column({ name: 'study_id' })
  studyId!: string;

  @Column({
    name: 'analysis_status',
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING,
  })
  analysisStatus!: AnalysisStatus;

  @Column({ name: 'analysis_results', type: 'json', nullable: true })
  analysisResults?: any;

  @Column({ type: 'text', nullable: true })
  findings?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'ai_model_id' })
  aiModelId!: string;

  @ManyToOne(() => AiModel, (model) => model.analyses)
  @JoinColumn({ name: 'ai_model_id' })
  aiModel!: AiModel;
}
