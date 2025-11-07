import { BaseEntity } from '@backend/database';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ServiceRoom } from './services-rooms.entity';

@Entity('services')
@Index(['serviceCode'], { unique: true })
@Index(['serviceName'], { unique: true })
export class Services extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'service_id' })
  id!: string;

  @Column({ name: 'service_code', length: 20, unique: true })
  serviceCode!: string;

  @Column({ name: 'service_name', length: 100 })
  serviceName!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => ServiceRoom, (serviceRoom) => serviceRoom.service)
  serviceRooms!: ServiceRoom[];
}
