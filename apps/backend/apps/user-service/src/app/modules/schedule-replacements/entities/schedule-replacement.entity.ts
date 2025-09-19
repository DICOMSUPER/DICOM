import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EmployeeSchedule } from '../../employee-schedules/entities/employee-schedule.entity';

import { ReplacementStatus } from '@backend/shared-enums';

@Entity('schedule_replacements')
@Index(['originalScheduleId'])
@Index(['replacementDate'])
export class ScheduleReplacement {
  @PrimaryGeneratedColumn('uuid', { name: 'replacement_id' })
  id!: string;

  @Column({ name: 'original_schedule_id', type: 'uuid' })
  originalScheduleId!: string;

  @ManyToOne(() => EmployeeSchedule)
  @JoinColumn({ name: 'original_schedule_id' })
  originalSchedule!: EmployeeSchedule;

  @Column({ name: 'replacement_user_id', type: 'uuid' })
  replacementUserId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'replacement_user_id' })
  replacementUser!: User;

  @Column({ name: 'replacement_date', type: 'date' })
  replacementDate!: Date;

  @Column({ name: 'replacement_start_time', type: 'time' })
  replacementStartTime!: string;

  @Column({ name: 'replacement_end_time', type: 'time' })
  replacementEndTime!: string;

  @Column({ type: 'enum', enum: ReplacementStatus, default: ReplacementStatus.REQUESTED })
  status!: ReplacementStatus;

  @Column({ name: 'requested_by', type: 'uuid' })
  requestedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requester!: User;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver?: User;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
