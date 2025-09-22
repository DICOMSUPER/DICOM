import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { DicomStudy } from './dicom-study.entity';
import { DicomInstance } from './dicom-instance.entity';
import { BaseEntity } from '@backend/entities';

@Entity('dicom_series')
@Index('idx_study_id', ['studyId'])
@Index('idx_series_instance_uid', ['seriesInstanceUid'])
@Index('idx_study_series', ['studyId', 'seriesNumber'])
export class DicomSeries extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'series_id' })
  id!: string;

  @Column({ name: 'series_instance_uid', length: 255, unique: true })
  seriesInstanceUid!: string;

  @Column({ name: 'study_id' })
  studyId!: string;

  @Column({ name: 'series_number', type: 'int' })
  seriesNumber!: number;

  @Column({ name: 'series_description', type: 'text', nullable: true })
  seriesDescription?: string;

  //   @Column({ length: 10, nullable: true })
  //   modality?: string;

  @Column({ name: 'body_part_examined', length: 100, nullable: true })
  bodyPartExamined?: string;

  @Column({ name: 'series_date', type: 'date', nullable: true })
  seriesDate?: Date;

  @Column({ name: 'series_time', type: 'time', nullable: true })
  seriesTime?: string;

  @Column({ name: 'protocol_name', length: 255, nullable: true })
  protocolName?: string;

  @Column({ name: 'number_of_instances', default: 0 })
  numberOfInstances!: number;

  // Relations
  @ManyToOne(() => DicomStudy, (study) => study.series)
  @JoinColumn({ name: 'study_id' })
  study!: DicomStudy;

  @OneToMany(() => DicomInstance, (instance) => instance.series)
  instances!: DicomInstance[];
}
