import { BaseEntity } from '@backend/database';
import { DicomStudyStatus } from '@backend/shared-enums';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DicomSeries } from './dicom-series.entity';
import { ImagingModality } from './imaging-modality.entity';
import { ImagingOrder } from './imaging-order.entity';
import { ModalityMachine } from './modality-machine.entity';

@Entity('dicom_studies')
@Index('idx_patient_id', ['patientId'])
@Index('idx_study_date', ['studyDate'])
// @Index('idx_modality_id', ['modalityId'])
@Index('idx_study_instance_uid', ['studyInstanceUid'])
@Index('idx_patient_study_date', ['patientId', 'studyDate'])
export class DicomStudy extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'study_id' })
  id!: string;

  @Column({ name: 'study_instance_uid', length: 255, unique: true })
  studyInstanceUid!: string;

  @Column({ name: 'patient_id' })
  patientId!: string;

  @Column({ name: 'patient_code', length: 255, nullable: true })
  patientCode?: string;

  @Column({ name: 'order_id', nullable: true })
  orderId?: string;

  @Column({
    name: 'modality_machine_id',
    // nullable: true
  }) //tempory fix, adjust in db
  modalityMachineId!: string;

  @Column({ name: 'study_date', type: 'date' })
  studyDate!: Date;

  @Column({ name: 'study_time', type: 'time' })
  studyTime!: string;

  @Column({ name: 'study_description', type: 'text', nullable: true })
  studyDescription?: string;

  @Column({ name: 'referring_physician', length: 100, nullable: true })
  referringPhysicianId?: string;

  @Column({ name: 'performing_technician_id', nullable: true })
  performingTechnicianId?: string;

  @Column({ name: 'verifying_radiologist_id', nullable: true })
  verifyingRadiologistId?: string;

  @Column({
    name: 'study_status',
    type: 'enum',
    enum: DicomStudyStatus,
    default: DicomStudyStatus.SCANNED,
  })
  studyStatus!: DicomStudyStatus;

  @Column({ name: 'number_of_series', default: 0 })
  numberOfSeries!: number;

  // @Column({ name: 'number_of_instances', default: 0 })
  // numberOfInstances!: number;

  @Column({
    name: 'storage_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  storagePath?: string | null;

  // Relations
  @OneToMany(() => DicomSeries, (series) => series.study)
  series!: DicomSeries[];

  @ManyToOne(() => ModalityMachine)
  @JoinColumn({ name: 'modality_machine_id' })
  modalityMachine?: ModalityMachine;

  //   imaging_order
  @ManyToOne(() => ImagingOrder)
  @JoinColumn({ name: 'order_id' })
  imagingOrder?: ImagingOrder;
}
