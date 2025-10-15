import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@backend/entities';
import { WorkingHours } from './working-hours.entity';

@Entity('break_times')
export class BreakTime extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ 
    type: 'varchar',
    length: 100,
    name: 'break_name'
  })
  breakName!: string;

  @Column({ 
    type: 'time',
    name: 'start_time'
  })
  startTime!: string;

  @Column({ 
    type: 'time',
    name: 'end_time'
  })
  endTime!: string;

  @Column({ 
    type: 'uuid',
    name: 'working_hours_id'
  })
  workingHoursId!: string;

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

  @ManyToOne(() => WorkingHours, workingHours => workingHours.breakTimes)
  @JoinColumn({ name: 'working_hours_id' })
  workingHours!: WorkingHours;
}
