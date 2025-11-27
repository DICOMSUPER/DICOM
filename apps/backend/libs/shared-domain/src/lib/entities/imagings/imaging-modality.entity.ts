import { BaseEntity } from '@backend/database';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ModalityMachine } from './modality-machine.entity';

@Entity('imaging_modalities')
export class ImagingModality extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'modality_id' })
  id!: string;

  @Column({ name: 'modality_code', length: 10, unique: true })
  modalityCode!: string;

  @Column({ name: 'modality_name', length: 50 })
  modalityName!: string;

  @Column({ name: 'description', length: 50, nullable: true })
  description!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => ModalityMachine, (machine) => machine.modality)
  modalityMachines?: ModalityMachine[];
}
