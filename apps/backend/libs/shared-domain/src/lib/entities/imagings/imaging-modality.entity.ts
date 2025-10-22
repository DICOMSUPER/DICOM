import { BaseEntity } from '@backend/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('imaging_modalities')
export class ImagingModality extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'modality_id' }) // Type string but increment => error =>Changed to UUID
  id!: string;

  @Column({ name: 'modality_code', length: 10, unique: true })
  modalityCode!: string;

  @Column({ name: 'modality_name', length: 50 })
  modalityName!: string;

  @Column({ name: 'description', length: 50, nullable: true })
  description!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
