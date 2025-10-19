import { BaseEntity } from '@backend/entities';
import { BodyPart } from '@backend/shared-enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('request_procedure')
export class RequestProcedure extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'name', length: 50 })
  name!: string;

  @Column({ name: 'body_part', type: 'enum', enum: BodyPart })
  bodyPart!: BodyPart;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
