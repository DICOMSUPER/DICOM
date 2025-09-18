import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { QueueStatus, Priority } from '@backend/shared-enums';
import { PatientVisit } from './patient-visit.entity';

@Entity('queue_assignments')

@Index(['queueNumber'])
export class QueueAssignment {
  @PrimaryGeneratedColumn('uuid', { name: 'queue_id' })
  id!: string;

  @Column({ name: 'visit_id', type: 'uuid' })
  visitId!: string;

  @ManyToOne(() => PatientVisit)
  @JoinColumn({ name: 'visit_id' })
  visit!: PatientVisit;

  @Column({ name: 'queue_number', type: 'int' })
  queueNumber!: number;

  @Column({ name: 'assignment_date', type: 'timestamp' })
  assignmentDate!: Date;

  @Column({ name: 'assignment_expires_date', type: 'timestamp' })
  assignmentExpiresDate!: Date;

  @Column({ type: 'enum', enum: QueueStatus, default: QueueStatus.WAITING })
  status!: QueueStatus;

  @Column({ type: 'enum', enum: Priority, default: Priority.NORMAL })
  priority!: Priority;

  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId!: string;

  @Column({ name: 'priority_reason', type: 'text', nullable: true })
  priorityReason?: string;

  // created by reception staff
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
