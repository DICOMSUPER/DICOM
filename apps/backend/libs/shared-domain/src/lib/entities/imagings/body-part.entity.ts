import { BaseEntity } from '@backend/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('body_part')
export class BodyPart extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'name', length: 50 })
  name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

}
