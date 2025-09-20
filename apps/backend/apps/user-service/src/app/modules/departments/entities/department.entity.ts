import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid', { name: 'department_id' })
  id!: string;

  @Column({ name: 'head_department_id', nullable: true })
  headDepartmentId!: string;

  @Column({ name: 'department_name', length: 100, nullable: false })
  departmentName!: string;

  @Column({ name: 'department_code', length: 10, unique: true })
  departmentCode!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'head_department_id' })
  headDepartment!: User;

  @OneToMany(() => User, user => user.department)
  users!: User[];
}
