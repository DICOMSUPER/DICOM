import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RoomType } from '@backend/shared-enums';
import { RoomAssignment } from './room-assignment.entity';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid', { name: 'room_id' })
  id!: string;

  @Column({ name: 'room_code', length: 20, unique: true })
  roomCode!: string;

  @Column({ name: 'room_type', type: 'enum', enum: RoomType, nullable: true })
  roomType?: RoomType;

  @Column({ name: 'department', length: 100, nullable: true })
  department?: string;

  @Column({ name: 'floor', type: 'int', nullable: true })
  floor?: number;

  @Column({ name: 'capacity', type: 'int', nullable: true })
  capacity?: number;

  @Column({ name: 'price_per_day', type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerDay?: number;

  @Column({ name: 'status', type: 'enum', enum: RoomStatus, default: RoomStatus.AVAILABLE })
  status!: RoomStatus;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'has_tv', default: false })
  hasTV!: boolean;

  @Column({ name: 'has_air_conditioning', default: false })
  hasAirConditioning!: boolean;

  @Column({ name: 'has_wifi', default: false })
  hasWiFi!: boolean;

  @Column({ name: 'has_telephone', default: false })
  hasTelephone!: boolean;

  @Column({ name: 'has_attached_bathroom', default: false })
  hasAttachedBathroom!: boolean;

  @Column({ name: 'is_wheelchair_accessible', default: false })
  isWheelchairAccessible!: boolean;

  @Column({ name: 'has_oxygen_supply', default: false })
  hasOxygenSupply!: boolean;

  @Column({ name: 'has_nurse_call_button', default: false })
  hasNurseCallButton!: boolean;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => RoomAssignment, assignment => assignment.room)
  assignments!: RoomAssignment[];
}
