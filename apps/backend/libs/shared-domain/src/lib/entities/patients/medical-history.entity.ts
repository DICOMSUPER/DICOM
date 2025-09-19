import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('medical_history')
export class MedicalHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'history_id' })
  id!: string;

  @Column({ type: 'text', nullable: true })
  allergies?: string;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
