import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('qualifications')
export class Qualification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 50 })
  institution!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'text' })
  image!: string;

  @Column({ length: 50, nullable: true })
  description?: string;

  @Column({ name: 'emp_id' })
  empId!: string;

  
  @ManyToOne(() => User, user => user.qualifications)
  @JoinColumn({ name: 'emp_id' })
  employee!: User;
}
