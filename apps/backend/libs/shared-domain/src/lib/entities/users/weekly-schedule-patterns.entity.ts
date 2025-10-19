import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { ShiftTemplate } from './shift-templates.entity';
import { DayOfWeek } from '@backend/shared-enums';
import { User } from './user.entity';

@Entity('weekly_schedule_patterns')
@Index(['userId', 'dayOfWeek'])
@Index(['effectiveFrom'])
export class WeeklySchedulePattern extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'pattern_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek!: DayOfWeek;

  @Column({ name: 'shift_template_id', type: 'uuid', nullable: true })
  shiftTemplateId?: string;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'shift_template_id' })
  shiftTemplate?: ShiftTemplate;

  @Column({ name: 'custom_start_time', type: 'time', nullable: true })
  customStartTime?: string;

  @Column({ name: 'custom_end_time', type: 'time', nullable: true })
  customEndTime?: string;

  @Column({ name: 'is_working_day', default: true,nullable: true })
  isWorkingDay!: boolean;

  @Column({ name: 'effective_from', type: 'date', nullable: true })
  effectiveFrom!: Date;

  @Column({ name: 'effective_until', type: 'date', nullable: true })
  effectiveUntil?: Date;

  @Column({ name: 'is_active', default: true, nullable: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}