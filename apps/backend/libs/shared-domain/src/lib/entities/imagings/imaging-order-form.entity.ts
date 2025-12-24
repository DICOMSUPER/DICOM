import { BaseEntity } from '@backend/database';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImagingOrder } from './imaging-order.entity';
import { Patient } from '../patients';
@Entity('imaging_order_forms')
@Index(['patientId'])
export class ImagingOrderForm extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'order_form_id' })
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @Column({ name: 'diagnosis', type: 'varchar', nullable: true })
  diagnosis?: string;

  @Column({ name: 'encounter_id', type: 'uuid' })
  encounterId!: string;

  @Column({ name: 'ordering_physician_id', type: 'uuid' })
  orderingPhysicianId!: string;

  @OneToMany(() => ImagingOrder, (order) => order.imagingOrderForm)
  imagingOrders!: ImagingOrder[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId!: string;

  patient?: Patient;
}
