import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Roles } from '@backend/shared-enums';
import { Department, EmployeeSchedule } from '@backend/shared-domain';
import { Qualification } from '@backend/shared-domain';
import { RoomAssignment } from '@backend/shared-domain';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id!: string;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ name: 'first_name', length: 50 })
  firstName!: string;

  @Column({ name: 'last_name', length: 50 })
  lastName!: string;

  @Column({ length: 20, nullable: true })
  phone!: string;

  @Column({ name: 'employee_id', length: 20, unique: true, nullable: true })
  employeeId!: string;

  @Column({ name: 'is_verified', nullable: true })
  isVerified!: boolean;

  @Column({ type: 'enum', enum: Roles, nullable: true })
  role!: Roles;

  @Column({ name: 'department_id', nullable: true })
  departmentId!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy!: string;

  // Relations
  @ManyToOne(() => Department, (department) => department.users)
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @OneToMany(() => Qualification, (qualification) => qualification.employee)
  qualifications!: Qualification[];

  // @OneToMany(() => RoomAssignment, (roomAssignment) => roomAssignment.employee)
  // roomAssignments!: RoomAssignment[];
  @OneToMany(
    () => EmployeeSchedule,
    (employeeSchedule) => employeeSchedule.employee
  )
  employeeSchedules!: EmployeeSchedule[];
}
