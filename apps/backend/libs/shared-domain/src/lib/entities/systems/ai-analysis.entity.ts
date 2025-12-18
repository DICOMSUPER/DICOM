import { BaseEntity } from '@backend/database';
import { AnalysisStatus } from '@backend/shared-enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ai_analyses')
export class AiAnalysis extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'analysis_id' })
  id!: string;

  @Column({ name: 'study_id', nullable: true })
  studyId!: string;

  @Column({ name: 'original_image_url', nullable: true })
  originalImage?: string;

  @Column({ name: 'original_image_name', nullable: true })
  originalImageName?: string;

  @Column({ name: 'ai_analyze_message', type: 'text', nullable: true })
  aiAnalyzeMessage?: string;

  @Column({
    name: 'analysis_status',
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING,
  })
  analysisStatus!: AnalysisStatus;

  @Column({ name: 'analysis_results', type: 'json', nullable: true })
  analysisResults?: any;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string;

  @Column({ name: 'ai_model_id', nullable: true })
  aiModelId!: string;

  @Column({ name: 'model_name', length: 150, nullable: true })
  modelName?: string;

  @Column({ name: 'version_name', length: 50, nullable: true })
  versionName?: string;

  @Column({ name: 'is_helpful', type: 'boolean', nullable: true })
  isHelpful?: boolean;

  @Column({ name: 'feedback_comment', type: 'text', nullable: true })
  feedbackComment?: string;

  @Column({ name: 'feedback_user_id', type: 'uuid', nullable: true })
  feedbackUserId?: string;

  @Column({ name: 'feedback_at', type: 'timestamp', nullable: true })
  feedbackAt?: Date;
}
