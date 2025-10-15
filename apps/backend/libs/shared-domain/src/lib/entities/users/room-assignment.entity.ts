import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity('room_assignments')
@Index(['room_id', 'assigned_from', 'assigned_to'])
@Index(['employee_id', 'assigned_from', 'assigned_to'])
@Index(['is_active'])
export class RoomAssignment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  assignment_id!: string;

  @Column({ type: 'uuid', nullable: false })
  room_id!: string;

  @Column({ type: 'uuid', nullable: false })
  employee_id!: string;

  @Column({ type: 'date', nullable: false })
  assigned_from!: string;

  @Column({ type: 'date', nullable: true })
  assigned_to?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role_in_room?: string;

  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  // Relations
  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;
}
