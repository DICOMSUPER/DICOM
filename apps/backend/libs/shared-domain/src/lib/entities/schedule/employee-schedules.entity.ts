import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { ScheduleStatus } from '@backend/shared-enums';
import { User } from '../users/user.entity';
import { Room } from '../rooms/rooms.entity';
import { ShiftTemplate } from './shift-templates.entity';

@Entity('employee_schedules')
@Index(['employee_id', 'work_date'])
@Index(['room_id', 'work_date'])
@Index(['work_date'])
@Index(['schedule_status'])
export class EmployeeSchedule extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  schedule_id!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  employee_id!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  room_id?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shift_template_id?: string;

  @Column({ type: 'date', nullable: false })
  work_date!: string;

  @Column({ type: 'time', nullable: true })
  actual_start_time?: string;

  @Column({ type: 'time', nullable: true })
  actual_end_time?: string;

  @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.SCHEDULED })
  schedule_status!: ScheduleStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  overtime_hours!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created_by?: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee!: User;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room?: Room;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'shift_template_id' })
  shift_template?: ShiftTemplate;
}
