import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@backend/entities';
import { BreakTime } from './break-times.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

@Entity('working_hours')
export class WorkingHours extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ 
    type: 'enum', 
    enum: DayOfWeek,
    name: 'day_of_week'
  })
  dayOfWeek!: DayOfWeek;

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
    type: 'boolean',
    default: true,
    name: 'is_enabled'
  })
  isEnabled!: boolean;

  @Column({ 
    type: 'text',
    nullable: true
  })
  description?: string;

  @OneToMany(() => BreakTime, breakTime => breakTime.workingHours)
  breakTimes!: BreakTime[];
}

