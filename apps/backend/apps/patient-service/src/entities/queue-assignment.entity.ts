import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PatientEncounter } from './patient-encounter.entity';

export enum QueueStatus {
  waiting = 'waiting',
  completed = 'completed'
}

// Priority levels aligned with common international levels
// 0 – routine, 1 – urgent, 2 – stat/emergency
export enum PriorityLevel {
  routine = 'routine',
  urgent = 'urgent',
  stat = 'stat'
}

@Entity('queue_assignments')
export class QueueAssignment extends BaseEntity {
  @Column({ name: 'queue_id', primary: true })
  queueId!: string;

  @Column({ name: 'queue_number', length: 20 })
  queueNumber!: string;

  @Column({ name: 'room_id', nullable: true })
  roomId?: string;

  @Column({ name: 'priority_level', type: 'enum', enum: PriorityLevel, default: PriorityLevel.routine })
  priorityLevel!: PriorityLevel;

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt!: Date;

  @Column({ name: 'priority_reason', type: 'text', nullable: true })
  priorityReason?: string;

  @Column({ name: 'status', type: 'enum', enum: QueueStatus, default: QueueStatus.waiting })
  status!: QueueStatus;

  @Column({ name: 'encounter_id' })
  encounterId!: string;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @ManyToOne(() => PatientEncounter)
  @JoinColumn({ name: 'encounter_id' })
  encounter!: PatientEncounter;
}