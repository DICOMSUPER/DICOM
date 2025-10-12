import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@backend/database';
import { Roles } from '@backend/shared-enums';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id!: string;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ name: 'first_name', length: 50 })
  firstName!: string;

  @Column({ name: 'last_name', length: 50 })
  lastName!: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'employee_id', length: 20, unique: true, nullable: true })
  employeeId?: string;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column({ type: 'enum', enum: Roles, nullable: true })
  role?: Roles;

  @Column({ name: 'department_id', nullable: true })
  departmentId?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;
}
