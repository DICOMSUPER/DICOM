import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { ScheduleStatus } from '@backend/shared-enums';
import { User } from '../users/user.entity';
import { EmployeeSchedule } from './employee-schedules.entity';

@Entity('schedule_replacements')
@Index(['original_schedule_id'])
@Index(['replacement_employee_id'])
export class ScheduleReplacement extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  replacement_id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  original_schedule_id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  replacement_employee_id: string;

  @Column({ type: 'text', nullable: false })
  reason: string;

  @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.SCHEDULED })
  replacement_status: ScheduleStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created_by: string;

  // Relations
  @ManyToOne(() => EmployeeSchedule)
  @JoinColumn({ name: 'original_schedule_id' })
  original_schedule: EmployeeSchedule;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'replacement_employee_id' })
  replacement_employee: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
