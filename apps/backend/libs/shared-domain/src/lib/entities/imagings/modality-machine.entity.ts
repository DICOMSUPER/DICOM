import { BaseEntity } from '@backend/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImagingModality } from './imaging-modality.entity';
import { MachineStatus } from '@backend/shared-enums';

@Entity('modality_machines')
export class ModalityMachine extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'machine_id' })
  id!: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'modality_id', type: 'uuid' })
  modalityId!: string;

  @ManyToOne(() => ImagingModality, { nullable: true })
  @JoinColumn({ name: 'modality_id' })
  modality!: ImagingModality;

  @Column({
    name: 'manufacturer',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  manufacturer?: string;

  @Column({ name: 'model', type: 'varchar', length: 255, nullable: true })
  model?: string;

  @Column({
    name: 'serial_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  serialNumber?: string;

  // reference to room entity in user service
  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: MachineStatus,
    default: MachineStatus.ACTIVE,
  })
  status!: MachineStatus;
}
