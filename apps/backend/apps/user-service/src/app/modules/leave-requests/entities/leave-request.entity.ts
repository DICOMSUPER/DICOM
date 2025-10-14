import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@backend/shared-domain';
import { LeaveType, LeaveStatus } from '@backend/shared-enums';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid', { name: 'leave_id' })
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @Column({ name: 'leave_type', type: 'enum', enum: LeaveType })
  leaveType!: LeaveType;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: Date;

  @Column({ name: 'total_days', type: 'decimal', precision: 3, scale: 1 })
  totalDays!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'leave_status', type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
  leaveStatus!: LeaveStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver?: User;
}
