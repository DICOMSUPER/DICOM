import { BaseEntity } from '@backend/database';
import { AnalysisStatus } from '@backend/shared-enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ai_analyses')
export class AiAnalysis extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'analysis_id' })
  id!: string;

  @Column({ name: 'study_id', nullable: true })
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

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string;

  @Column({ name: 'ai_model_id' })
  aiModelId!: string;

  @Column({ name: 'model_name', length: 150, nullable: true })
  modelName?: string;

  @Column({ name: 'version_name', length: 50, nullable: true })
  versionName?: string;


}
