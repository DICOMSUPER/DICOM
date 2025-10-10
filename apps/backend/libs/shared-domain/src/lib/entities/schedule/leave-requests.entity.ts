import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { LeaveType, LeaveStatus } from '@backend/shared-enums';
import { User } from '../users/user.entity';

@Entity('leave_requests')
export class LeaveRequest extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  leave_id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  employee_id: string;

  @Column({ type: 'enum', enum: LeaveType, nullable: false })
  leave_type: LeaveType;

  @Column({ type: 'date', nullable: false })
  start_date: string;

  @Column({ type: 'date', nullable: false })
  end_date: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: false })
  total_days: number;

  @Column({ type: 'text', nullable: false })
  reason: string;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
  leave_status: LeaveStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User;
}
