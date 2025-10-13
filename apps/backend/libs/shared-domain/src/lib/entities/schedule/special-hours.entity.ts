import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@backend/entities';

@Entity('special_hours')
export class SpecialHours extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ 
    type: 'date'
  })
  date!: string;

  @Column({ 
    type: 'time',
    name: 'start_time',
    nullable: true
  })
  startTime?: string;

  @Column({ 
    type: 'time',
    name: 'end_time',
    nullable: true
  })
  endTime?: string;

  @Column({ 
    type: 'boolean',
    default: false,
    name: 'is_holiday'
  })
  isHoliday!: boolean;

  @Column({ 
    type: 'text',
    nullable: true
  })
  description?: string;

  @Column({ 
    type: 'boolean',
    default: true,
    name: 'is_active'
  })
  isActive!: boolean;
}

