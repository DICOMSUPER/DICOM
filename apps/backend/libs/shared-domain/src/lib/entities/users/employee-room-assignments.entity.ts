import { BaseEntity } from '@backend/database';
import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { RoomSchedule } from './room-schedules.entity';
import { User } from './user.entity';

@Entity('employee_room_assignments')
export class EmployeeRoomAssignment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'assignment_id' })
  id!: string;

  @Column({ name: 'room_schedule_id', type: 'uuid'})
  roomScheduleId!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @ManyToOne(() => RoomSchedule, (roomSchedule) => roomSchedule.employeeRoomAssignments, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'room_schedule_id' })
  roomSchedule!: RoomSchedule;

  @ManyToOne(() => User, (user) => user.employeeRoomAssignments, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'employee_id' })
  employee!: User;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}