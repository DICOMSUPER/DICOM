import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('imaging_modalities')
export class ImagingModality {
  @PrimaryGeneratedColumn('uuid', { name: 'modality_id' }) // Type string but increment => error =>Changed to UUID
  id!: string;

  @Column({ name: 'modality_code', length: 10, unique: true })
  modalityCode!: string;

  @Column({ name: 'modality_name', length: 50 })
  modalityName!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_deleted', default: false }) //add for soft delete
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
