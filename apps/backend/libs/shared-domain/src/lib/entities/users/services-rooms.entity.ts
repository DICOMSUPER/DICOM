import { BaseEntity } from '@backend/database';
import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Services } from './service.entity';
import { Room } from './room.entity';
import { PatientEncounter } from '../patients';

@Entity('services_rooms')
export class ServiceRoom extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'service_room_id' })
  id!: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId!: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: string;


  @ManyToOne(() => Services, (service) => service.serviceRooms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service!: Services;

  @ManyToOne(() => Room, (room) => room.serviceRooms, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;


  patientEncounter?: PatientEncounter[];
}