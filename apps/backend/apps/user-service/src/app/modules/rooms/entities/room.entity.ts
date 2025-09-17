import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RoomType } from '@backend/shared-enums';
import { RoomAssignment } from '../../room-assignments/entities/room-assignment.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid', { name: 'room_id' })
  id!: string;

  @Column({ name: 'room_code', length: 20, unique: true })
  roomCode!: string;

  @Column({ name: 'room_type', type: 'enum', enum: RoomType, nullable: true })
  roomType!: RoomType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => RoomAssignment, assignment => assignment.room)
  assignments!: RoomAssignment[];
}
