import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { User } from '../users/user.entity';
import { Room } from '../rooms/rooms.entity';
import { ShiftTemplate } from './shift-templates.entity';

@Entity('weekly_schedule_patterns')
@Index(['employee_id'])
@Index(['effective_from', 'effective_to'])
export class WeeklySchedulePattern extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  pattern_id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  employee_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  room_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  monday_shift_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tuesday_shift_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  wednesday_shift_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  thursday_shift_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  friday_shift_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  saturday_shift_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sunday_shift_id: string;

  @Column({ type: 'date', nullable: false })
  effective_from: string;

  @Column({ type: 'date', nullable: true })
  effective_to: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  created_by: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'monday_shift_id' })
  monday_shift: ShiftTemplate;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'tuesday_shift_id' })
  tuesday_shift: ShiftTemplate;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'wednesday_shift_id' })
  wednesday_shift: ShiftTemplate;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'thursday_shift_id' })
  thursday_shift: ShiftTemplate;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'friday_shift_id' })
  friday_shift: ShiftTemplate;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'saturday_shift_id' })
  saturday_shift: ShiftTemplate;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'sunday_shift_id' })
  sunday_shift: ShiftTemplate;
}
