import { BaseEntity } from '@backend/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ImagingModality } from './imaging-modality.entity';
import { BodyPart } from './body-part.entity';

@Entity('request_procedure')
export class RequestProcedure extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'name', length: 50 })
  name!: string;

  @Column({ name: 'modality_id', type: 'uuid' })
  modalityId!: string;

  @ManyToOne(() => ImagingModality, { nullable: true, eager: true })
  @JoinColumn({ name: 'modality_id' })
  modality!: ImagingModality;

  @Column({ name: 'body_part_id', type: 'uuid' })
  bodyPartId!: string;

  @ManyToOne(() => BodyPart, { nullable: true, eager: true })
  @JoinColumn({ name: 'body_part_id' })
  bodyPart!: BodyPart;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
