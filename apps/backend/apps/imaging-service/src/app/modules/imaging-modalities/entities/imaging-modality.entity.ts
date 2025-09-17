import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('imaging_modalities')
export class ImagingModality {
  @PrimaryGeneratedColumn('increment', { name: 'modality_id' })
  id!: string;

  @Column({ name: 'modality_code', length: 10, unique: true })
  modalityCode!: string;

  @Column({ name: 'modality_name', length: 50 })
  modalityName!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
