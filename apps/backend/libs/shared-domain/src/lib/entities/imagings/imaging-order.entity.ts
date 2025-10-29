import { BaseEntity } from '@backend/entities';
import { OrderStatus } from '@backend/shared-enums';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImagingModality } from './imaging-modality.entity';
import { RequestProcedure } from './request-procedure.entity';
import { DicomStudy } from './dicom-study.entity';
@Entity('imaging_orders')
@Index(['patientId'])
export class ImagingOrder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  id!: string;

  @Column({ name: 'order_number', type: 'int', nullable: true })
  orderNumber!: number;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @Column({ name: 'ordering_physician_id', type: 'uuid' })
  orderingPhysicianId!: string;

  // @Column({ name: 'modality_id', type: 'uuid' })
  // modalityId!: string;

  // @ManyToOne(() => ImagingModality, { nullable: true, eager: true })
  // @JoinColumn({ name: 'modality_id' })
  // modality!: ImagingModality;

  @Column({ name: 'procedure_id', type: 'uuid', nullable: true })
  procedureId?: string;

  @ManyToOne(() => RequestProcedure, { nullable: true, eager: true })
  @JoinColumn({ name: 'procedure_id' })
  procedure?: RequestProcedure;

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus!: OrderStatus;

  // @Column({ name: 'body_part', length: 100 })
  // bodyPart!: string;

  @Column({ name: 'completed_date', type: 'timestamp', nullable: true })
  completedDate?: Date;

  @Column({ name: 'clinical_indication', type: 'text', nullable: true })
  clinicalIndication?: string;

  @Column({ name: 'contrast_required', default: false })
  contrastRequired!: boolean;

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions?: string;

  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId!: string;

  //   @Column({ name: 'technologist_id', type: 'uuid', nullable: true })
  //   technologistId?: string;

  //   @Column({ name: 'radiologist_id', type: 'uuid', nullable: true })
  //   radiologistId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => DicomStudy, (study) => study.imagingOrder)
  studies!: DicomStudy[];
}
