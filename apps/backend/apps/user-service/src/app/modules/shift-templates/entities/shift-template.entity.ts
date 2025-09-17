import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ShiftType } from '@backend/shared-enums';

@Entity('shift_templates')
export class ShiftTemplate {
  @PrimaryGeneratedColumn('uuid', { name: 'shift_template_id' })
  id!: string;

  @Column({ name: 'shift_name', length: 50 })
  shiftName!: string;

  @Column({ name: 'shift_type', type: 'enum', enum: ShiftType })
  shiftType!: ShiftType;

  @Column({ name: 'start_time', type: 'time' })
  startTime!: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime!: string;

  @Column({ name: 'break_start_time', type: 'time', nullable: true })
  breakStartTime?: string;

  @Column({ name: 'break_end_time', type: 'time', nullable: true })
  breakEndTime?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
