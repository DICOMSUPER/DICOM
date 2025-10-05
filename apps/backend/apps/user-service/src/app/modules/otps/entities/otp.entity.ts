import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';



@Entity('otps')
@Index(['userId'])
@Index(['expiresAt'])
export class Otp {
  @PrimaryGeneratedColumn('uuid', { name: 'otp_id' })
  id!: string;

  @Column({ name: 'email' })
  email!: string;


  //   @ManyToOne(() => User)
  //   @JoinColumn({ name: 'user_id' })
  //   user!: User;

  @Column({ name: 'otp_code', length: 10 })
  otpCode!: string;

  //   @Column({ type: 'enum', enum: OtpType })
  //   type!: OtpType;

  //   @Column({ type: 'enum', enum: OtpStatus, default: OtpStatus.ACTIVE })
  //   status!: OtpStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt?: Date;

  //   @Column({ name: 'attempt_count', default: 0 })
  //   attemptCount!: number;

  //   @Column({ name: 'max_attempts', default: 3 })
  //   maxAttempts!: number;

  //   @Column({ name: 'ip_address', length: 45, nullable: true })
  //   ipAddress?: string;

  //   @Column({ name: 'user_agent', type: 'text', nullable: true })
  //   userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}