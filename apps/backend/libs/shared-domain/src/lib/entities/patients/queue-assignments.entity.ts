import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '@backend/entities';
import { QueueStatus, QueuePriorityLevel } from '@backend/shared-enums';
import { PatientEncounter } from './patient-encounters.entity';

@Entity('queue_assignments')
@Index(['queueNumber'])
export class QueueAssignment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'queue_id' })
  id!: string;

  @Column({ name: 'encounter_id', type: 'uuid', nullable: true })
  encounterId?: string;
  
  @ManyToOne(() => PatientEncounter)
  @JoinColumn({ name: 'encounter_id' })
  encounter!: PatientEncounter;

  @Column({ name: 'queue_number', type: 'int' })
  queueNumber!: number;

  @Column({ name: 'assignment_date', type: 'timestamp' })
  assignmentDate!: Date;

  @Column({ name: 'assignment_expires_date', type: 'timestamp' })
  assignmentExpiresDate!: Date;

  @Column({ type: 'enum', enum: QueueStatus, default: QueueStatus.WAITING })
  status!: QueueStatus;

  @Column({
    type: 'enum',
    enum: QueuePriorityLevel,
    default: QueuePriorityLevel.ROUTINE,
  })
  priority!: QueuePriorityLevel;

  @Column({ name: 'room_id', type: 'uuid', nullable: true })
  roomId!: string;

  @Column({ name: 'priority_reason', type: 'text', nullable: true })
  priorityReason?: string;

  // @Column({ name: 'validation_token', type: 'varchar', length: 12, unique: true })
  // validationToken!: string;

  @Column({ name: 'estimated_wait_time', type: 'int', nullable: true })
  estimatedWaitTime?: number; // in minutes

  @Column({ name: 'called_at', type: 'timestamp', nullable: true })
  calledAt?: Date;

  @Column({ name: 'called_by', type: 'uuid', nullable: true })
  calledBy?: string;

  // created by reception staff
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy?: string;
}
