import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index('idx_user_id', ['userId']) // ✅ tạo index tên cụ thể cho dễ quản lý
export class DigitalSignature {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  signedData!: string;

  @Column()
  certificateSerial!: string;

  @Column()
  algorithm!: string;

  @Column({ type: 'text', nullable: true })
  publicKey?: string;

  @Column({ type: 'text', nullable: true })
  privateKeyEncrypted?: string;

  @Column({ nullable: false })
  pinHash?: string;

  @CreateDateColumn()
  createdAt!: Date;

  // ✅ Index giúp truy vấn theo user nhanh hơn
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.digitalSignatures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
