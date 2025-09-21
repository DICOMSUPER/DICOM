import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DicomSeries } from '../../dicom-series/entities/dicom-series.entity';
import { ImagingModality } from '../../imaging-modalities/entities/imaging-modality.entity';
import { DicomStudyStatus } from '@backend/shared-enums';
import { ImagingOrder } from '../../imaging-orders/entities/imaging-order.entity';
import { BaseEntity } from '@backend/entities';

@Entity('dicom_studies')
@Index('idx_patient_id', ['patientId'])
@Index('idx_study_date', ['studyDate'])
@Index('idx_modality_id', ['modalityId'])
@Index('idx_study_instance_uid', ['studyInstanceUid'])
@Index('idx_patient_study_date', ['patientId', 'studyDate'])
export class DicomStudy extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'study_id' })
  id!: string;

  @Column({ name: 'study_instance_uid', length: 255, unique: true })
  studyInstanceUid!: string;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ name: 'order_id', nullable: true })
  orderId?: string;

  @Column({ name: 'modality_id' })
  modalityId!: string;

  @Column({ name: 'study_date', type: 'date' })
  studyDate!: Date;

  @Column({ name: 'study_time', type: 'time' })
  studyTime!: string;

  @Column({ name: 'study_description', type: 'text', nullable: true })
  studyDescription?: string;

  @Column({ name: 'referring_physician', length: 100, nullable: true })
  referringPhysician?: string;

  @Column({ name: 'performing_physician_id', nullable: true })
  performingPhysicianId?: string;

  @Column({ name: 'technician_id', nullable: true })
  technicianId?: string;

  @Column({
    name: 'study_status',
    type: 'enum',
    enum: DicomStudyStatus,
    default: DicomStudyStatus.IN_PROGRESS,
  })
  studyStatus!: DicomStudyStatus;

  @Column({ name: 'number_of_series', default: 0 })
  numberOfSeries!: number;

  // @Column({ name: 'number_of_instances', default: 0 })
  // numberOfInstances!: number;

  @Column({ name: 'storage_path', length: 500, nullable: true })
  storagePath?: string;

  // Relations
  @OneToMany(() => DicomSeries, (series) => series.study)
  series!: DicomSeries[];

  @ManyToOne(() => ImagingModality)
  @JoinColumn({ name: 'modality_id' })
  modality!: ImagingModality;

  //   imaging_order
  @ManyToOne(() => ImagingOrder)
  @JoinColumn({ name: 'order_id' })
  imagingOrder?: ImagingOrder;
}
