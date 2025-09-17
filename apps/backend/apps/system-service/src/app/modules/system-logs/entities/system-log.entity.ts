import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

import { LogLevel, LogCategory } from '@backend/shared-enums';
@Entity('system_logs')
@Index(['level'])
@Index(['category'])
@Index(['timestamp'])
@Index(['source'])
export class SystemLog {
  @PrimaryGeneratedColumn('uuid', { name: 'log_id' })
  id!: string;

  @Column({ type: 'enum', enum: LogLevel })
  log_level!: LogLevel;

  @Column({ type: 'enum', enum: LogCategory })
  category!: LogCategory;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
