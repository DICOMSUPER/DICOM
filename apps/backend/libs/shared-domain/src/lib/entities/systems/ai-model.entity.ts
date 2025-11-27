import { BaseEntity } from '@backend/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ai_model')
export class AiModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'model_id' })
  id!: string;

  @Column({ name: 'name', length: 150 })
  name!: string;

  @Column({ name: 'provider', length: 100, nullable: true })
  provider?: string;

  @Column({ name: 'external_model_id', length: 200, nullable: true })
  externalModelId?: string;

  @Column({ name: 'body_part', length: 200, nullable: true })
  bodyPartName?: string;

  @Column({ name: 'version', length: 50, nullable: true })
  version?: string;

  @Column({ name: 'url', type: 'text', nullable: true })
  url?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // @OneToMany(() => AiAnalysis, (analysis) => analysis.aiModel)
  // analyses!: AiAnalysis[];
}
