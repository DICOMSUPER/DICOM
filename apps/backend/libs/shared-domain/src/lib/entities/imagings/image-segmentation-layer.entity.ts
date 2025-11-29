import { BaseEntity } from '@backend/database';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DicomInstance } from './dicom-instance.entity';

@Entity('image_segmentation_layers')
export class ImageSegmentationLayer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'image_segmentation_id' })
  id!: string;

  @Column({ name: 'layer_name', length: 50 })
  layerName!: string;

  @Column({ name: 'instance_id', type: 'uuid' })
  instanceId!: string;

  @ManyToOne(() => DicomInstance)
  @JoinColumn({ name: 'instance_id' })
  instance!: DicomInstance;

  @Column({ name: 'segmentator_id', type: 'uuid' })
  segmentatorId!: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'frame', type: 'int' })
  frame?: number = 1;

  @Column({ name: 'snapshots', type: 'json' })
  snapshots!: object[];
}
