import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DicomInstance } from './dicom-instance.entity';
import { AnnotationType, AnnotationStatus } from '@backend/shared-enums';
import { BaseEntity } from '@backend/entities';

@Entity('image_annotations')
@Index(['instanceId'])
export class ImageAnnotation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'annotation_id' })
  id!: string;

  @Column({ name: 'instance_id', type: 'uuid' })
  instanceId!: string;

  @ManyToOne(() => DicomInstance)
  @JoinColumn({ name: 'instance_id' })
  instance!: DicomInstance;

  @Column({ name: 'annotation_type', type: 'enum', enum: AnnotationType })
  annotationType!: AnnotationType;

  @Column({ name: 'annotation_data', type: 'json' })
  annotationData!: Record<string, any>;

  @Column({ name: 'coordinates', type: 'json', nullable: true })
  coordinates?: Record<string, any>;

  @Column({
    name: 'measurement_value',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  measurementValue?: number;

  @Column({ name: 'measurement_unit', length: 20, nullable: true })
  measurementUnit?: string;

  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent?: string;

  @Column({ name: 'color_code', length: 7, nullable: true })
  colorCode?: string;

  @Column({
    name: 'annotation_status',
    type: 'enum',
    enum: AnnotationStatus,
    default: AnnotationStatus.DRAFT,
  })
  annotationStatus!: AnnotationStatus;

  @Column({ name: 'annotator_id', type: 'uuid' })
  annotatorId!: string;

  @Column({
    name: 'annotation_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  annotationDate!: Date;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId?: string;

  @Column({ name: 'review_date', type: 'timestamp', nullable: true })
  reviewDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
