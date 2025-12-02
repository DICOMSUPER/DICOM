import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@backend/database';
import type { User } from './user.entity';
import type { Room } from './room.entity';

@Entity('departments')
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'department_id' })
  id!: string;

  @Column({ name: 'head_department_id', nullable: true })
  headDepartmentId!: string | null;

  @Column({ name: 'department_name', length: 100, nullable: false })
  departmentName!: string;

  @Column({ name: 'department_code', length: 10, unique: true })
  departmentCode!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  // Relations
  @ManyToOne(() => require('./user.entity').User)
  @JoinColumn({ name: 'head_department_id' })
  headDepartment!: User;
  
  @OneToMany(() => require('./room.entity').Room, (room: Room) => room.department)
  rooms!: Room[];

  @OneToMany(() => require('./user.entity').User, (user: User) => user.department)
  users!: User[];
}
