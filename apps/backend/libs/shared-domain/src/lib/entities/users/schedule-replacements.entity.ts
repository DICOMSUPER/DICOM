import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { ScheduleStatus } from '@backend/shared-enums';
import { EmployeeSchedule } from './employee-schedules.entity';
import { User } from './user.entity';

@Entity('schedule_replacements')
@Index(['original_schedule_id'])
@Index(['replacement_employee_id'])
export class ScheduleReplacement extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  replacement_id!: string;

  @Column({ type: 'uuid', nullable: false })
  original_schedule_id!: string;

  @Column({ type: 'uuid', nullable: false })
  replacement_employee_id!: string;

  @Column({ type: 'text', nullable: false })
  reason!: string;

  @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.SCHEDULED })
  replacement_status!: ScheduleStatus;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  // Relations
  @ManyToOne(() => EmployeeSchedule)
  @JoinColumn({ name: 'original_schedule_id' })
  original_schedule!: EmployeeSchedule;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'replacement_employee_id' })
  replacement_employee!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;
}
