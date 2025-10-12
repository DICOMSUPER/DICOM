import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { ShiftType } from '@backend/shared-enums';

@Entity('shift_templates')
export class ShiftTemplate extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  shift_template_id!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  shift_name!: string;

  @Column({ type: 'enum', enum: ShiftType, nullable: false })
  shift_type!: ShiftType;

  @Column({ type: 'time', nullable: false })
  start_time!: string;

  @Column({ type: 'time', nullable: false })
  end_time!: string;

  @Column({ type: 'time', nullable: true })
  break_start_time?: string;

  @Column({ type: 'time', nullable: true })
  break_end_time?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}
