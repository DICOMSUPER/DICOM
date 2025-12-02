import { Roles } from '@backend/shared-enums';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@backend/database';
import type { EmployeeRoomAssignment } from './employee-room-assignments.entity';
import type { Department } from './department.entity';
import type { DiagnosesReport } from '../patients/diagnoses-reports.entity';
import type { DigitalSignature } from './digital-signature.entity';
import type { Qualification } from './qualification.entity';

@Entity('users')
export class User extends BaseEntity {
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
  departmentId!: string | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy!: string;

  // Relations
  @ManyToOne(() => require('./department.entity').Department, (department: Department) => department.users)
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @OneToMany(() => require('./qualification.entity').Qualification, (qualification: Qualification) => qualification.employee)
  qualifications!: Qualification[];

  // @OneToMany(() => RoomAssignment, (roomAssignment) => roomAssignment.employee)
  // roomAssignments!: RoomAssignment[];
  @OneToMany(
    () => require('./employee-room-assignments.entity').EmployeeRoomAssignment,
    (employeeRoomAssignment: EmployeeRoomAssignment) => employeeRoomAssignment.employee
  )
  employeeRoomAssignments!: EmployeeRoomAssignment[];
  @OneToMany(() => require('./digital-signature.entity').DigitalSignature, (sig: DigitalSignature) => sig.user)
  digitalSignatures!: DigitalSignature[];
  
  diagnosisReports!: DiagnosesReport[];
}
