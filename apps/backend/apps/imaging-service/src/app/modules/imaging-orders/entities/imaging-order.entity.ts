import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import {
  OrderType,
  OrderPriority,
  OrderStatus,
  Urgency,
} from '@backend/shared-enums';
import { ImagingModality } from '../../imaging-modalities/entities/imaging-modality.entity';

@Entity('imaging_orders')
@Index(['patientId'])
export class ImagingOrder {
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  id!: string;

  @Column({ name: 'order_number', length: 50, unique: true })
  orderNumber!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  //   @Column({ name: 'visit_id', type: 'uuid', nullable: true })
  //   visitId?: string;

  @Column({ name: 'ordering_physician_id', type: 'uuid' })
  orderingPhysicianId!: string;

  @Column({ name: 'modality_id', type: 'uuid' })
  modalityId!: string;

  @ManyToMany(() => ImagingModality)
  @JoinColumn({ name: 'modality_id' })
  modality!: ImagingModality;

  @Column({ name: 'body_part', length: 100 })
  bodyPart!: string;

  //   @Column({ name: 'procedure_code', length: 20, nullable: true })
  //   procedureCode?: string;

  //   @Column({ name: 'procedure_description', type: 'text' })
  //   procedureDescription!: string;

  @Column({ name: 'order_type', type: 'enum', enum: OrderType })
  orderType!: OrderType;

  @Column({
    name: 'urgency',
    type: 'enum',
    enum: Urgency,
    default: Urgency.ROUTINE,
  })
  urgency!: Urgency;

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus!: OrderStatus;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
