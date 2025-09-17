import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ShiftTemplate } from '../../shift-templates/entities/shift-template.entity';
import { DayOfWeek } from '@backend/shared-enums';

@Entity('weekly_schedule_patterns')
@Index(['userId', 'dayOfWeek'])
@Index(['effectiveFrom'])
export class WeeklySchedulePattern {
  @PrimaryGeneratedColumn('uuid', { name: 'pattern_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

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

  @Column({ name: 'is_working_day', default: true })
  isWorkingDay!: boolean;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom!: Date;

  @Column({ name: 'effective_until', type: 'date', nullable: true })
  effectiveUntil?: Date;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
