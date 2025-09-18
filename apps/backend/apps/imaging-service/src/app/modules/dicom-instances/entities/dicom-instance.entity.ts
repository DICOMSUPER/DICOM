import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DicomSeries } from '../../dicom-series/entities/dicom-series.entity';

@Entity('dicom_instances')
@Index('idx_series_id', ['seriesId'])
@Index('idx_sop_instance_uid', ['sopInstanceUid'])
@Index('idx_series_instance', ['seriesId', 'instanceNumber'])
export class DicomInstance {
  @PrimaryGeneratedColumn('uuid', { name: 'instance_id' })
  id!: string;

  @Column({ name: 'sop_instance_uid', length: 255, unique: true })
  sopInstanceUid!: string;

  @Column({ name: 'series_id' })
  seriesId!: string;

  @Column({ name: 'instance_number', type: 'int' })
  instanceNumber!: number;

  @Column({ name: 'file_path', length: 500 })
  filePath!: string;

  @Column({ name: 'file_name', length: 255 })
  fileName!: string;

  @Column({ name: 'image_position', type: 'json', nullable: true })
  imagePosition?: object;

  @Column({ name: 'image_orientation', type: 'json', nullable: true })
  imageOrientation?: object;

  @Column({ name: 'pixel_spacing', type: 'json', nullable: true })
  pixelSpacing?: object;

  @Column({
    name: 'slice_thickness',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
  })
  sliceThickness?: number;

  @Column({ name: 'window_center', type: 'int', nullable: true })
  windowCenter?: number;

  @Column({ name: 'window_width', type: 'int', nullable: true })
  windowWidth?: number;

  @Column({ type: 'int', nullable: true })
  rows?: number;

  @Column({ type: 'int', nullable: true })
  columns?: number;

  @Column({ name: 'is_deleted', nullable: true })
  isDeleted?: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => DicomSeries, (series) => series.instances)
  @JoinColumn({ name: 'series_id' })
  series!: DicomSeries;
}
