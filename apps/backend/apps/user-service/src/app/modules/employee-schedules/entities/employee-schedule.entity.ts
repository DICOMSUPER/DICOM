import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';
import { ShiftTemplate } from '../../shift-templates/entities/shift-template.entity';
import { ScheduleStatus } from '@backend/shared-enums';

@Entity('employee_schedules')
@Index('idx_employee_work_date', ['employeeId', 'workDate'])

export class EmployeeSchedule {
  @PrimaryGeneratedColumn('uuid', { name: 'schedule_id' })
  id!: string;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @Column({ name: 'room_id', nullable: true })
  roomId?: string;

  @Column({ name: 'shift_template_id', nullable: true })
  shiftTemplateId?: string;

  @Column({ name: 'work_date', type: 'date' })
  workDate!: Date;

  @Column({ name: 'actual_start_time', type: 'time', nullable: true })
  actualStartTime?: string;

  @Column({ name: 'actual_end_time', type: 'time', nullable: true })
  actualEndTime?: string;

  @Column({ name: 'schedule_status', type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.SCHEDULED })
  scheduleStatus!: ScheduleStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'overtime_hours', type: 'decimal', precision: 4, scale: 2, default: 0 })
  overtimeHours!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;


  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee!: User;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room?: Room;

  @ManyToOne(() => ShiftTemplate)
  @JoinColumn({ name: 'shift_template_id' })
  shiftTemplate?: ShiftTemplate;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator?: User;
}
