import { BaseEntity } from '@backend/entities';
import { OrderStatus } from '@backend/shared-enums';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImagingOrderForm } from './imaging-order-form.entity';
import { RequestProcedure } from './request-procedure.entity';
import { DicomStudy } from './dicom-study.entity';
@Entity('imaging_orders')
export class ImagingOrder extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  id!: string;

  @Column({ name: 'order_number', type: 'int', nullable: true })
  orderNumber!: number;

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

  @Column({ name: 'order_form_id', type: 'uuid', nullable: true })
  imagingOrderFormId?: string;

  @ManyToOne(() => ImagingOrderForm, { nullable: true, eager: true })
  @JoinColumn({ name: 'order_form_id' })
  imagingOrderForm?: ImagingOrderForm;

  @Column({ name: 'completed_date', type: 'timestamp', nullable: true })
  completedDate?: Date;

  @Column({ name: 'clinical_indication', type: 'text', nullable: true })
  clinicalIndication?: string;

  @Column({ name: 'contrast_required', default: false })
  contrastRequired!: boolean;

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions?: string;

  //   @Column({ name: 'technologist_id', type: 'uuid', nullable: true })
  //   technologistId?: string;

  //   @Column({ name: 'radiologist_id', type: 'uuid', nullable: true })
  //   radiologistId?: string;

  @OneToMany(() => DicomStudy, (study) => study.imagingOrder)
  studies!: DicomStudy[];
}
