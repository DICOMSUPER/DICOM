import { BaseEntity } from '@backend/database';
import { ScheduleStatus } from '@backend/shared-enums';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmployeeRoomAssignment } from './employee-room-assignments.entity';
import { Room } from './room.entity';
import { ShiftTemplate } from './shift-templates.entity';

@Entity('room_schedules')
@Index(['room_id', 'work_date'])
@Index(['work_date'])
@Index(['schedule_status'])
export class RoomSchedule extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  schedule_id!: string;

  // @Column({ type: 'uuid', nullable: false })
  // employee_id!: string;

  @Column({ type: 'uuid', nullable: true })
  room_id?: string;

  @Column({ type: 'uuid', nullable: true })
  shift_template_id?: string;

  @Column({ type: 'date', nullable: false })
  work_date!: string;

  @Column({ type: 'time', nullable: true })
  actual_start_time?: string;

  @Column({ type: 'time', nullable: true })
  actual_end_time?: string;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.SCHEDULED,
  })
  schedule_status!: ScheduleStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  overtime_hours!: number;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @OneToMany(
    () => EmployeeRoomAssignment,
    (assignment) => assignment.roomSchedule
  )
  employeeRoomAssignments!: EmployeeRoomAssignment[];

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room?: Room;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'shift_template_id' })
  shift_template?: ShiftTemplate;
}
