import { BaseEntity } from '@backend/database';
import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import type { Services } from './service.entity';
import type { Room } from './room.entity';
import { PatientEncounter } from '../patients';

@Entity('services_rooms')
export class ServiceRoom extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'service_room_id' })
  id!: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId!: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: string;


  @ManyToOne(() => require('./service.entity').Services, (service: Services) => service.serviceRooms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service!: Services;

  @ManyToOne(() => require('./room.entity').Room, (room: Room) => room.serviceRooms, { 
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