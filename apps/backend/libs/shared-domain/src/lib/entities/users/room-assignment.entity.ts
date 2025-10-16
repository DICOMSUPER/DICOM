import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '@backend/shared-domain';
import { Room } from '@backend/shared-domain';
import { AssignmentType } from '@backend/shared-enums';


@Entity('room_assignments')
@Index(['userId', 'roomId'])
@Index(['assignmentDate'])
export class RoomAssignment {
  @PrimaryGeneratedColumn('uuid', { name: 'assignment_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, user => user.roomAssignments)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => Room, room => room.assignments)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({ name: 'assignment_type', type: 'enum', enum: AssignmentType })
  assignmentType!: AssignmentType;

  @Column({ name: 'assignment_date', type: 'date' })
  assignmentDate!: Date;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime?: string;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
