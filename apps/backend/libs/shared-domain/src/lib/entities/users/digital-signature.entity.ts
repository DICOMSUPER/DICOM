import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
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

  @Column({ type: 'text', nullable: true, select: false })
  privateKeyEncrypted?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.digitalSignatures, {
    onDelete: 'CASCADE',
  })
  user!: User;
}
