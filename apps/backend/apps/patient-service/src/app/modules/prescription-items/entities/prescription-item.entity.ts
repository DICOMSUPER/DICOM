import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Prescription } from '../../prescriptions/entities/prescription.entity';

@Entity('prescription_items')
@Index(['prescriptionId'])
@Index(['medicationName'])
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' })
  id!: string;

  @Column({ name: 'prescription_id', type: 'uuid' })
  prescriptionId!: string;

  @ManyToOne(() => Prescription, prescription => prescription.items)
  @JoinColumn({ name: 'prescription_id' })
  prescription!: Prescription;

  @Column({ name: 'medication_name', length: 255 })
  medicationName!: string;

  @Column({ name: 'dosage', length: 50, nullable: true })
  dosage?: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ length: 20, nullable: true })
  unit!: string;

  @Column({ type: 'int', nullable: true })
  frequency!: number;

  @Column({ name: 'duration', type: 'int' })
  duration!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
